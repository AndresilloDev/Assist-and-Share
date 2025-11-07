import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});