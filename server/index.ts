import Express from 'express';
import { config as loadEnvConfig } from 'dotenv';
import cors from 'cors';
import { validationResult, param } from 'express-validator';

loadEnvConfig();

const PORT = process.env.PORT || 5002;
const app = Express();
app.use(Express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.get('/', (_, res) => res.send('Hello world'));
app.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Please enter a valid id. Id must be a number.'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params?.id || '';
    return res.send('Hello world ' + id);
  },
);

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
