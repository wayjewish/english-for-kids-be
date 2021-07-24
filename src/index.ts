import * as dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

import swaggerUi from 'swagger-ui-express';

import userRouter from './routes/user';
import categoryRouter from './routes/category';
import wordRouter from './routes/word';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerDocument = require('./doc/api.json');

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());

if (process.env.DATABASE_URL) {
  mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to DB'));

app.use(express.json());

app.use('/user', userRouter);
app.use('/category', categoryRouter);
app.use('/word', wordRouter);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => res.status(404).json({ description: 'Page not found' }));

app.listen(port, () => console.log('server started'));
