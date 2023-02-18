import { Router } from 'express';
import {
  createUser,
  createUserValidationSchema,
  deleteUser,
  deleteUserValidationSchema,
  getUser,
  getUsers,
  updateUser,
  updateUserValidationSchema,
} from '../controllers/User';
import { validate } from '../util';

const userRouter = Router();

userRouter
  .get('/', getUsers)
  .post('/', validate(createUserValidationSchema), createUser)
  .get('/:id', validate(deleteUserValidationSchema), getUser)
  .put('/:id', validate(updateUserValidationSchema), updateUser)
  .patch('/:id', validate(updateUserValidationSchema), updateUser)
  .delete('/:id', validate(deleteUserValidationSchema), deleteUser);

export default userRouter;
