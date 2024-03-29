import { Schema, model } from 'mongoose';

export const genders = ['male', 'female', 'other'] as const;
export const userRoles = ['developer', 'admin', 'project_manager', 'client'] as const;

export type Gender = (typeof genders)[number];
export type UserRole = (typeof userRoles)[number];

export type UserType = {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: Gender;
  role?: UserRole;
};
const UserSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  age: {
    type: Number,
    required: false,
    default: 13,
    min: 13,
    max: 100,
  },
  gender: {
    type: String,
    required: false,
    default: 'unknown',
    enum: ['male', 'female', 'other', 'unknown'],
  },
  role: {
    type: String,
    required: false,
    enum: ['developer', 'admin', 'project_manager', 'client'],
    default: 'developer',
  },
});

const User = model<UserType>('user', UserSchema);
export default User;
