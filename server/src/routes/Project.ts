import { Router } from 'express';
import {
  createProject,
  createProjectValidation,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
  updateProjectValition,
} from '../controllers/Project';
import { deleteUserValidationSchema } from '../controllers/User';
import { authenticateToken, validate } from '../utils';

const projectRouter = Router();

projectRouter
  // .get('/', authenticateToken, getProjects)
  .post('/', authenticateToken, validate(createProjectValidation), createProject)
  .get('/:id', authenticateToken, validate(deleteUserValidationSchema), getProject)
  .put('/:id', authenticateToken, validate(updateProjectValition), updateProject)
  .patch('/:id', authenticateToken, validate(updateProjectValition), updateProject)
  .delete('/:id', authenticateToken, validate(deleteUserValidationSchema), deleteProject);

export default projectRouter;
