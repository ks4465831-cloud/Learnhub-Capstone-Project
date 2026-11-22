const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isOwnerOrAdmin, canAccessCourse } = require('../utils/access');

// GET /api/courses/:id/lessons  - full content, only for owner/admin/enrolled student
exports.getLessons = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!(await canAccessCourse(req.user, course))) throw new AppError('Enrol in this course to view lessons', 403);
  const lessons = await Lesson.find({ course: course._id }).sort('order');
  res.json({ course, lessons });
});

// POST /api/courses/:id/lessons  (owner)
exports.addLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!isOwnerOrAdmin(req.user, course)) throw new AppError('Not your course', 403);
  const { moduleId, title, content, videoUrl } = req.body;
  if (!course.modules.id(moduleId)) throw new AppError('Module not found in this course', 400);
  const order = await Lesson.countDocuments({ course: course._id });
  const lesson = await Lesson.create({ course: course._id, module: moduleId, title, content, videoUrl, order });
  res.status(201).json({ lesson });
});

const loadOwnedLesson = async (req) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) throw new AppError('Lesson not found', 404);
  const course = await Course.findById(lesson.course);
  if (!isOwnerOrAdmin(req.user, course)) throw new AppError('Not your course', 403);
  return lesson;
};

// PUT /api/lessons/:lessonId
exports.updateLesson = asyncHandler(async (req, res) => {
  const lesson = await loadOwnedLesson(req);
  ['title', 'content', 'videoUrl'].forEach((f) => {
    if (req.body[f] !== undefined) lesson[f] = req.body[f];
  });
  await lesson.save();
  res.json({ lesson });
});

// DELETE /api/lessons/:lessonId
exports.deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await loadOwnedLesson(req);
  await Enrollment.updateMany({ course: lesson.course }, { $pull: { completedLessons: lesson._id } });
  await lesson.deleteOne();
  res.json({ message: 'Lesson deleted' });
});
