import { Request } from 'express';
import { UserDocument } from 'src/schema';

declare global {
  interface CustomRequest extends Request {
    user?: Partial<UserDocument>; // Define the appropriate type for user
  }
  interface jwtPayload {
    id: string;
    email: string;
    roles?: UserRole[];
  }
}

export {};
