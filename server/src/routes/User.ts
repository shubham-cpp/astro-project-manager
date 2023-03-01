import { Router } from 'express';
import {
  createUser,
  createUserValidationSchema,
  deleteUser,
  deleteUserValidationSchema,
  getUser,
  getUsers,
  loginUser,
  loginUserValidationSchema,
  logoutUser,
  refreshTokenValidationSchema,
  tokenRefresh,
  updateUser,
  updateUserValidationSchema,
} from '../controllers/User';
import { validate } from '../util';

const userRouter = Router();

userRouter
  .get('/', getUsers)
  .post('/', validate(createUserValidationSchema), createUser)
  .post('/login', validate(loginUserValidationSchema), loginUser)
  .post('/refresh', validate(refreshTokenValidationSchema), tokenRefresh)
  .delete('/logout', validate(refreshTokenValidationSchema), logoutUser)
  .get('/:id', validate(deleteUserValidationSchema), getUser)
  .put('/:id', validate(updateUserValidationSchema), updateUser)
  .patch('/:id', validate(updateUserValidationSchema), updateUser)
  .delete('/:id', validate(deleteUserValidationSchema), deleteUser);

export default userRouter;
