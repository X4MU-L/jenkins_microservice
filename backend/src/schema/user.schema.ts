// users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRoleEnum } from '../types';
import { comparePasswords, hashPassword } from '../utils';

export type UserDocument = User &
  Document & { comparePassword(enteredPassword: string): Promise<boolean> };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true, select: false })
  password: string;
  @Prop({ default: Date.now })
  createdAt: Date;
  @Prop({ type: [String], enum: UserRoleEnum, default: [UserRoleEnum.USER] })
  roles: UserRole[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePassword = async function (
  this: UserDocument,
  enteredPassword: string,
) {
  return comparePasswords(enteredPassword, this.password);
};

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});
