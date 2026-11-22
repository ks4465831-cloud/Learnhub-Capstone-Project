const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [Number],
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

attemptSchema.index({ student: 1, quiz: 1 });
attemptSchema.index({ course: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
