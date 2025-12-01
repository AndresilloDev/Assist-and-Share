import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import connectDB from './config/db.js';
import passport from 'passport';
import "./config/passport.js";

connectDB();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});