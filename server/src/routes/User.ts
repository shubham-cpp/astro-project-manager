import { Router } from 'express';
import {
  createUser,
  createUserValidationSchema,
  deleteUser,
  deleteUserValidationSchema,
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
  .delete('/logout', validate(refreshTokenValidationSchema), logoutUser)
  .get('/:id', validate(deleteUserValidationSchema), getUser) // this seems wrong by naming
  .put('/:id', authenticateToken, validate(updateUserValidationSchema), updateUser)
  .patch('/:id', authenticateToken, validate(updateUserValidationSchema), updateUser)
  .delete('/:id', authenticateToken, validate(deleteUserValidationSchema), deleteUser)
  .get('/:id/tasks', authenticateToken, validate(getUserTaskValidationSchema), getUserTasks);
export default userRouter;
