// user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserRoleEnum } from '../src/types';
import { ConfigService } from '@nestjs/config';
import {
  createMockAdmin,
  createMockJwtToken,
  createMockUser,
  createMockUserDocument,
  createMockUserDto,
} from './factories';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let jwtService: JwtService;
  jest.setTimeout(30000);

  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Set environment variable to override app's MongoDB connection
    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'MONGODB_URI') {
          return mongoUri;
        }
        if (key === 'JWT_SECRET') {
          return 'test-secret';
        }
        // Return default values for other config keys as needed
        return null;
      }),
    };

    mongoConnection = (await connect(mongoUri)).connection;
    console.log('Mongoose Connection State:', mongoConnection.readyState);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    jwtService = app.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongoConnection) {
      await mongoConnection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clear database collections before each test
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      console.log('Clearing collection:', collection.collectionName);
      await collection.deleteMany({});
    }
  });

  describe('/user/profile (GET)', () => {
    it('should return 401 if no token is provided', () => {
      return request(app.getHttpServer()).get('/user/profile').expect(401);
    });

    it('should return user profile with valid token', async () => {
      const dto = createMockUserDto();
      const user = createMockUser(dto);
      // Create a test user first
      const createUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      // Login to get token
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dto.email,
          password: dto.password,
        })
        .expect(200);

      // mock token creation
      const token = createMockJwtToken(createUserResponse.body);

      // Get profile with token
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', user.name);
          expect(res.body).toHaveProperty('email', user.email);
          expect(res.body).toHaveProperty('roles');
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });

  describe('/user/:id (GET)', () => {
    it('should return 401 if no token is provided', () => {
      return request(app.getHttpServer()).get('/user/someUserId').expect(401);
    });

    it('should return 403 if user is not an admin', async () => {
      // Create a regular user
      const dto = createMockUserDto({
        email: 'anotheruser@email.com',
      });
      const user = createMockUser(dto);

      const createUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      // Login as regular user
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dto.email,
          password: dto.password,
        })
        .expect(200);

      const _id = createUserResponse.body._id;
      // mock token creation
      const token = createMockJwtToken({
        ...user,
        _id,
      });

      // Try to access user by ID (should fail due to role)
      return request(app.getHttpServer())
        .get(`/user/${_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return user by ID if requester is admin', async () => {
      // admin dto
      const adminDto = createMockUserDto({
        roles: [UserRoleEnum.ADMIN],
        email: 'admin@example.com',
      });

      const adminUser = createMockUserDocument(createMockAdmin());

      const createUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(adminDto)
        .expect(201);

      // Create a regular user
      const regularUser = await mongoConnection.collection('users').insertOne({
        name: 'Regular User',
        email: 'regular@example.com',
        password:
          '$2b$10$X7GXjAcsBKP.NF9wr7.uJuBf0u4Z7SHeUH3ub7kSQvf6ctSoY9LVa',
        roles: [UserRoleEnum.USER],
        createdAt: new Date(),
      });

      const adminToken = createMockJwtToken(createUserResponse.body);
      // Admin can access any user
      return request(app.getHttpServer())
        .get(`/user/${regularUser.insertedId.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Regular User');
          expect(res.body).toHaveProperty('email', 'regular@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });
});
