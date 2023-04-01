import { model, ObjectId, Schema } from 'mongoose';

export interface ProjectType {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectOwner: ObjectId; // id of user who created the project / or is current owner of project
  tasks: ObjectId[];
  members: ObjectId[]; // ids of users
}

const projectSchema = new Schema<ProjectType>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
    },
    projectId: {
      type: String,
      required: true,
    },
    projectOwner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'task' }],
    members: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  },
  {
    timestamps: true,
  },
);

const Project = model<ProjectType>('project', projectSchema);
export default Project;
