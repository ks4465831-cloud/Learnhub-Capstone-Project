const mongoose = require('mongoose');

// Modules are EMBEDDED (small, always read with the course).
// Lessons are REFERENCED (large content, queried/updated on their own).
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Module title is required'], trim: true },
  order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 2000 },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    modules: [moduleSchema],
    status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text' }); // text search
courseSchema.index({ status: 1, category: 1 });             // catalogue filter
courseSchema.index({ instructor: 1 });

module.exports = mongoose.model('Course', courseSchema);
