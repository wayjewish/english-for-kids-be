import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CallbackError } from 'mongoose';
import StatsModel from '../models/stats';

const router = express.Router();

router.get('/', async (req, res) => {
  const filter: {
    word?: string;
  } = {};

  if (req.query.word && typeof req.query.word === 'string') {
    filter.word = req.query.word;
  }

  await StatsModel.find(filter)
    .populate('word')
    .exec((error: CallbackError, stats: typeof StatsModel[]) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(stats);
    });
});

router.get('/:id', async (req, res) => {
  await StatsModel.findById(req.params.id)
    .populate('word')
    .exec((error: CallbackError, stat: typeof StatsModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(stat);
    });
});

router.post('/', async (req, res) => {
  const newStat = new StatsModel({
    word: req.body.word,
    clicked: req.body.clicked,
    flipped: req.body.flipped,
    guessed: req.body.guessed,
    errors: req.body.errors,
    relation: req.body.relation,
  });

  await newStat.save((error: CallbackError, stat: typeof StatsModel) => {
    if (error) res.status(500).json({ message: error.message });
    res.json(stat);
  });
});

router.put('/:id', async (req, res) => {
  const newStat = new StatsModel({
    word: req.body.word,
    clicked: req.body.clicked,
    flipped: req.body.flipped,
    guessed: req.body.guessed,
    errors: req.body.errors,
    relation: req.body.relation,
  });

  await StatsModel.findByIdAndUpdate(req.params.id, newStat, { new: true }).exec(
    (error: CallbackError, stat: typeof StatsModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(stat);
    },
  );
});

router.delete('/:id', async (req, res) => {
  await StatsModel.findByIdAndDelete(req.params.id)
    .populate('word')
    .exec((error: CallbackError, word: typeof StatsModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(word);
    });
});

export default router;
