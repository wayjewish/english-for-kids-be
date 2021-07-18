import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  word: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
    required: true,
  },
  clicked: {
    type: Number,
    required: true,
    unique: true,
  },
  flipped: {
    type: Number,
    required: true,
  },
  guessed: {
    type: Number,
    required: true,
  },
  errors: {
    type: Number,
    required: true,
  },
  relation: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('Stats', statsSchema);
