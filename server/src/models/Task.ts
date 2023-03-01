import { Schema, model, ObjectId } from 'mongoose';

export type TaskTypes = 'story' | 'task' | 'epic' | 'bug';
export type StatusTypes = 'red' | 'orange' | 'green';

export type TaskType = {
  title: string;
  days: Date;
  type: TaskTypes;
  daysLeft: Date;
  description: string;
  createdBy: ObjectId; // user id
  currentOwner: ObjectId; // user id
  project:number;
  status: StatusTypes;
};
 
const TaskSchema = new Schema<TaskType>({
  title: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 24,
  },
  days: {
    type: Date,
    required: true,
  },
  daysLeft: {
    type: Date,
    required: true,
  },  
  description: {
    type: String,
    minLength: 2,
    maxLength: 100,
  },
  createdBy: {
    type: String,
    required: true,
  },
  project: {
    type: Number,
    required: true,
  },
  status: {
    type: String, 
    required: true,
    enum: ['red', 'orange', 'green'],
  },
  type: {
    type: String,
    required: true,
    enum: ['story', 'task', 'epic', 'bug'],
  },
})

const Task = model<TaskType>('task', TaskSchema);
export default Task;
