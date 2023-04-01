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
import { userIdValidationSchema } from '../controllers/User';
import { authenticateToken, validate } from '../utils';

const projectRouter = Router();

projectRouter
  // .get('/', authenticateToken, getProjects)
  .post('/', authenticateToken, validate(createProjectValidation), createProject)
  .get('/:id', authenticateToken, validate(userIdValidationSchema), getProject)
  .put('/:id', authenticateToken, validate(updateProjectValition), updateProject)
  .patch('/:id', authenticateToken, validate(updateProjectValition), updateProject)
  .delete('/:id', authenticateToken, validate(userIdValidationSchema), deleteProject);

export default projectRouter;
