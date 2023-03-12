import { Schema, model, ObjectId } from 'mongoose';

export type TaskTypes = 'story' | 'task' | 'epic' | 'bug';
export type StatusTypes = 'red' | 'orange' | 'green';

export type TaskType = {
  title: string;
  type: TaskTypes;
  daysAllocated: Date;
  daysRemaining: Date;
  description: string;
  createdBy: ObjectId; // user id
  currentOwner: ObjectId; // user id
  projectId:number;
  status: StatusTypes;
  createdOn: Date;
};
 
const TaskSchema = new Schema<TaskType>({
  title: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 24,
  },
  daysAllocated: {
    type: Date,
    // required: true,
  },
  daysRemaining : {
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
    type: String,
    required: true,
  },
  currentOwner: {
    type: String,
    required: true,
  },
  projectId: {
    type: Number,
    required: true,
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
  }
})

const Task = model<TaskType>('task', TaskSchema);
export default Task;
