import { Schema, model, ObjectId } from 'mongoose';
import User from './User';

export const taskTypes = ['story', 'task', 'epic', 'bug'] as const;
export const statusTypes = ['red', 'orange', 'green'] as const;

export type TaskTypes = (typeof taskTypes)[number]; // story | task | epic | wished
export type StatusTypes = (typeof statusTypes)[number];

export type TaskType = {
  title: string;
  type: TaskTypes;
  daysAllocated: Date;
  daysRemaining: Date;
  description: string;
  createdBy: ObjectId; // user id
  currentOwner: ObjectId; // user id
  projectId: string;
  status: StatusTypes;
  createdOn: Date;
};

const TaskSchema = new Schema<TaskType>({
  title: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  daysAllocated: {
    type: Date,
    // required: true,
  },
  daysRemaining: {
    type: Date,
    // required: true,
  },
  description: {
    type: String,
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    red: User,
    required: true,
  },
  currentOwner: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    // required: true,
    default: 'green',
    enum: ['red', 'orange', 'green'],
  },
  type: {
    type: String,
    // required: true,
    default: 'task',
    enum: ['story', 'task', 'epic', 'bug'],
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

const Task = model<TaskType>('task', TaskSchema);
export default Task;
