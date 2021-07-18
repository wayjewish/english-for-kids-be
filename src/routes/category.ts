import express from 'express';
import { CallbackError } from 'mongoose';
import CategoryModel from '../models/category';
import guard from '../middleware/guard';

const router = express.Router();

router.get('/', async (req, res) => {
  await CategoryModel.find().exec((error: CallbackError, categories: typeof CategoryModel[]) => {
    if (error) res.status(500).json({ message: error.message });
    res.json(categories);
  });
});

router.get('/:id', async (req, res) => {
  await CategoryModel.findById(req.params.id).exec(
    (error: CallbackError, category: typeof CategoryModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(category);
    },
  );
});

router.post('/', guard, async (req, res) => {
  const newCategory = new CategoryModel({
    name: req.body.name,
  });

  await newCategory.save((error: CallbackError, category: typeof CategoryModel) => {
    if (error) res.status(500).json({ message: error.message });
    res.json(category);
  });
});

router.put('/:id', guard, async (req, res) => {
  const newCategory = {
    name: req.body.name,
  };

  await CategoryModel.findByIdAndUpdate(req.params.id, newCategory, { new: true }).exec(
    (error: CallbackError, category: typeof CategoryModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(category);
    },
  );
});

router.delete('/:id', guard, async (req, res) => {
  await CategoryModel.findByIdAndDelete(req.params.id).exec(
    (error: CallbackError, category: typeof CategoryModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(category);
    },
  );
});

export default router;
