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
import { validate } from '../utils';

const userRouter = Router();

userRouter
  .get('/', getUsers)
  .post('/', validate(createUserValidationSchema), createUser)
  .post('/login', validate(loginUserValidationSchema), loginUser)
  .post('/refresh', validate(refreshTokenValidationSchema), tokenRefresh)
  .delete('/logout', validate(refreshTokenValidationSchema), logoutUser)
  .get('/:id', validate(deleteUserValidationSchema), getUser) // this seems wrong by naming
  .put('/:id', validate(updateUserValidationSchema), updateUser)
  .patch('/:id', validate(updateUserValidationSchema), updateUser)
  .delete('/:id', validate(deleteUserValidationSchema), deleteUser)
  .get('/:id/tasks', validate(getUserTaskValidationSchema), getUserTasks);
export default userRouter;
