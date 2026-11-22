const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: [true, 'Question text is required'] },
  options: {
    type: [String],
    validate: [(v) => v.length >= 2, 'A question needs at least 2 options'],
  },
  correctIndex: { type: Number, required: [true, 'Correct option is required'], min: 0 },
});

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: [true, 'Quiz title is required'], trim: true },
    passPercentage: { type: Number, default: 50, min: 0, max: 100 },
    questions: {
      type: [questionSchema],
      validate: [(v) => v.length >= 1, 'Quiz needs at least 1 question'],
    },
  },
  { timestamps: true }
);

quizSchema.index({ course: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
