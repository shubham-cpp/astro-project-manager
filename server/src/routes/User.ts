import { Router } from 'express';
import { getProjectsByOwner } from '../controllers/Project';
import {
  createUser,
  createUserValidationSchema,
  deleteUser,
  userIdValidationSchema,
  getUser,
  getUsers,
  getUserTasks,
  getUserTaskValidationSchema,
  loginUser,
  loginUserValidationSchema,
  logoutUser,
  refreshTokenValidationSchema,
  tokenRefresh,
  updateUser,
  updateUserValidationSchema,
} from '../controllers/User';
import { authenticateToken, validate } from '../utils';

const userRouter = Router();

userRouter
  .get('/', getUsers)
  .post('/', validate(createUserValidationSchema), createUser)
  .post('/login', validate(loginUserValidationSchema), loginUser)
  .post('/refresh', validate(refreshTokenValidationSchema), tokenRefresh)
  .get('/:id/projects', authenticateToken, validate(userIdValidationSchema), getProjectsByOwner)
  .delete('/logout', validate(refreshTokenValidationSchema), logoutUser)
  .get('/:id', authenticateToken, validate(userIdValidationSchema), getUser) // this seems wrong by naming
  .put('/:id', authenticateToken, validate(updateUserValidationSchema), updateUser)
  .patch('/:id', authenticateToken, validate(updateUserValidationSchema), updateUser)
  .delete('/:id', authenticateToken, validate(userIdValidationSchema), deleteUser)
  .get('/:id/tasks', authenticateToken, validate(getUserTaskValidationSchema), getUserTasks);
export default userRouter;
