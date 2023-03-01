import { Router } from 'express';
import { getTasks } from '../controllers/Task';

const taskRouter = Router();

taskRouter
    .get('/', getTasks)

export default taskRouter;