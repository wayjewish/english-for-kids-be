import express from 'express';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { CallbackError } from 'mongoose';
import WordModel from '../models/word';
import guard from '../middleware/guard';

const router = express.Router();
const loader = multer({ dest: path.join(__dirname, 'uploads') });

router.get('/', async (req, res) => {
  const filter: {
    category?: string;
  } = {};

  if (req.query.category && typeof req.query.category === 'string') {
    filter.category = req.query.category;
  }

  await WordModel.find(filter)
    .populate('category')
    .exec((error: CallbackError, words: typeof WordModel[]) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(words);
    });
});

router.get('/:id', async (req, res) => {
  await WordModel.findById(req.params.id)
    .populate('category')
    .exec((error: CallbackError, word: typeof WordModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(word);
    });
});

router.post('/', guard, loader.fields([{ name: 'image' }, { name: 'audio' }]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const image = await cloudinary.uploader.upload(files.image[0].path);
    const audio = await cloudinary.uploader.upload(files.audio[0].path, { resource_type: 'video' });

    const newWord = new WordModel({
      ...req.body,
      audio: audio.url,
      image: image.url,
    });

    await newWord.save((error: CallbackError, word: typeof WordModel) => {
      if (error) res.status(500).json({ message: error.message });
      newWord.populate('category', () => {
        res.json(word);
      });
    });

    fs.unlink(files.image[0].path);
    fs.unlink(files.audio[0].path);
  } catch (error) {
    res.send(error);
  }
});

router.put(
  '/:id',
  guard,
  loader.fields([{ name: 'image' }, { name: 'audio' }]),
  async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let image: UploadApiResponse | null = null;
      let audio: UploadApiResponse | null = null;
      if (files.image) image = await cloudinary.uploader.upload(files.image[0].path);
      if (files.audio)
        audio = await cloudinary.uploader.upload(files.audio[0].path, { resource_type: 'video' });

      const currentWord = await WordModel.findById(
        req.params.id,
        (error: CallbackError, word: typeof WordModel) => {
          if (error) res.status(500).json({ message: error.message });
          return word;
        },
      );

      const newWord = {
        word: currentWord.word,
        translation: currentWord.translation,
        audio: currentWord.audio,
        image: currentWord.image,
      };

      if (req.body.word) newWord.word = req.body.word;
      if (req.body.translation) newWord.translation = req.body.translation;
      if (audio) newWord.audio = audio.url;
      if (image) newWord.image = image.url;

      await WordModel.findByIdAndUpdate(req.params.id, newWord, { new: true })
        .populate('category')
        .exec((error: CallbackError, word: typeof WordModel) => {
          if (error) res.status(500).json({ message: error.message });
          res.json(word);
        });

      if (files.image) fs.unlink(files.image[0].path);
      if (files.audio) fs.unlink(files.audio[0].path);
    } catch (error) {
      res.send(error);
    }
  },
);

router.delete('/:id', guard, async (req, res) => {
  await WordModel.findByIdAndDelete(req.params.id)
    .populate('category')
    .exec((error: CallbackError, word: typeof WordModel) => {
      if (error) res.status(500).json({ message: error.message });
      res.json(word);
    });
});

export default router;
