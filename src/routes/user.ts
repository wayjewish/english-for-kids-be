import express from 'express';
import { CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user';
import guard from '../middleware/guard';

declare let process: {
  env: {
    JWT_KEY: string;
  };
};

const router = express.Router();

router.post('/login', async (req, res) => {
  const candidate = await UserModel.findOne(
    { login: req.body.login },
    (error: CallbackError, user: typeof UserModel) => {
      if (error) res.status(500).json({ message: error.message });
      return user;
    },
  );

  if (candidate) {
    const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);

    if (passwordResult) {
      const token = jwt.sign(
        {
          _id: candidate._id,
        },
        process.env.JWT_KEY,
        { expiresIn: '10h' },
      );

      res.json({
        token: `Bearer ${token}`,
      });
    } else {
      res.status(401).json({
        message: `Passwords don't match`,
      });
    }
  } else {
    res.status(404).json({
      message: 'There is no such login',
    });
  }
});

router.get('/', async (req, res) => {
  await UserModel.find().exec((error: CallbackError, users: typeof UserModel[]) => {
    if (error) res.status(500).json({ message: error.message });
    res.json(users);
  });
});

router.get('/:id', async (req, res) => {
  await UserModel.findById(req.params.id).exec((error: CallbackError, user: typeof UserModel) => {
    if (error) res.status(500).json({ message: error.message });
    res.json(user);
  });
});

router.post('/', async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const newUser = new UserModel({
    login: req.body.login,
    password: bcrypt.hashSync(req.body.password, salt),
  });

  await newUser.save((error: CallbackError, user: typeof UserModel) => {
    if (error) res.status(500).json({ message: error.message });
    res.json(user);
  });
});

router.put('/:id', async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const newUser = new UserModel({
    login: req.body.login,
    password: bcrypt.hashSync(req.body.password, salt),
  });

  await UserModel.findByIdAndUpdate(req.params.id, newUser, { new: true }).exec(
    (error: CallbackError, user: typeof UserModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(user);
    },
  );
});

router.delete('/:id', guard, async (req, res) => {
  await UserModel.findByIdAndDelete(req.params.id).exec(
    (error: CallbackError, user: typeof UserModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(user);
    },
  );
});

export default router;
