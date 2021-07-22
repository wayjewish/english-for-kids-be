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

  const options: {
    skip?: number;
    limit?: number;
  } = {};

  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.skip) options.skip = Number(req.query.skip);
  if (req.query.limit) options.limit = Number(req.query.limit);

  await WordModel.find(filter, null, options)
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

    let image: string | null = null;
    let audio: string | null = null;
    if (files.image) {
      const resImage: UploadApiResponse = await cloudinary.uploader.upload(files.image[0].path);
      image = resImage.url;
    }
    if (files.audio) {
      const resAudio: UploadApiResponse = await cloudinary.uploader.upload(files.audio[0].path, {
        resource_type: 'video',
      });
      audio = resAudio.url;
    }

    if (!image)
      image = 'https://res.cloudinary.com/wayjewish/image/upload/v1626985262/default_cz4f7g.jpg';
    if (!audio)
      audio = 'https://res.cloudinary.com/wayjewish/video/upload/v1626985054/default_shydxy.mp3';

    const newWord = new WordModel({
      ...req.body,
      audio,
      image,
    });

    await newWord.save((error: CallbackError, word: typeof WordModel) => {
      if (error) res.status(500).json({ message: error.message });
      newWord.populate('category', () => {
        res.json(word);
      });
    });

    if (files.image) fs.unlink(files.image[0].path);
    if (files.audio) fs.unlink(files.audio[0].path);
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

      let image: string | null = null;
      let audio: string | null = null;
      if (files.image) {
        const resImage: UploadApiResponse = await cloudinary.uploader.upload(files.image[0].path);
        image = resImage.url;
      }
      if (files.audio) {
        const resAudio: UploadApiResponse = await cloudinary.uploader.upload(files.audio[0].path, {
          resource_type: 'video',
        });
        audio = resAudio.url;
      }

      if (!image)
        image = 'https://res.cloudinary.com/wayjewish/image/upload/v1626985262/default_cz4f7g.jpg';
      if (!audio)
        audio = 'https://res.cloudinary.com/wayjewish/video/upload/v1626985054/default_shydxy.mp3';

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
        audio,
        image,
      };

      if (req.body.word) newWord.word = req.body.word;
      if (req.body.translation) newWord.translation = req.body.translation;

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
