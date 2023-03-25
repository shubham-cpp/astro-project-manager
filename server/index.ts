import cors from 'cors';
import { config as loadEnvConfig } from 'dotenv';
import Express from 'express';
import mongoose, { connect } from 'mongoose';
import userRouter from './src/routes/User';
import taskRouter from './src/routes/Task';

loadEnvConfig();

const PORT = process.env.PORT || 5002;
const URI = process.env.DB_URI;

if (!URI) {
  console.error('URI not found.\nEnviroment variable "DB_URI" is required.');
  process.exit(1);
}

const app = Express();

app.use(Express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/', (_, res) => res.send('Hello world'));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tasks', taskRouter);
mongoose.set('strictQuery', true);
connect(URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('ERROR: while connecting to mongo\n', err);
    process.exit(1);
  });
