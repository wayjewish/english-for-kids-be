import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CallbackError } from 'mongoose';
import UserModel from '../models/user';

declare let process: {
  env: {
    JWT_KEY: string;
  };
};

interface TokenInterface {
  _id: string;
}

const guard = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | null = null;
  const Authorization = req.header('Authorization');
  if (Authorization) {
    token = Authorization.replace('Bearer ', '');
  }

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    await UserModel.findOne({ _id: (decoded as TokenInterface)._id }, (error: CallbackError) => {
      if (error) res.status(500).json({ message: error.message });
    });
    next();
  } else {
    res.status(401).send({ message: 'Not authorized to access this resource' });
  }
};

export default guard;
