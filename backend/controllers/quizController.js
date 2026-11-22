const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isOwnerOrAdmin, canAccessCourse } = require('../utils/access');

// POST /api/courses/:id/quizzes  (owner)
exports.createQuiz = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!isOwnerOrAdmin(req.user, course)) throw new AppError('Not your course', 403);
  const { title, passPercentage, questions } = req.body;
  const quiz = await Quiz.create({ course: course._id, title, passPercentage, questions });
  res.status(201).json({ quiz });
});

// GET /api/courses/:id/quizzes  - students never receive the answers
exports.getQuizzes = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!(await canAccessCourse(req.user, course))) throw new AppError('Enrol in this course to view quizzes', 403);
  const query = Quiz.find({ course: course._id });
  if (!isOwnerOrAdmin(req.user, course)) query.select('-questions.correctIndex');
  res.json({ quizzes: await query });
});

// DELETE /api/quizzes/:id  (owner)
exports.deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw new AppError('Quiz not found', 404);
  const course = await Course.findById(quiz.course);
  if (!isOwnerOrAdmin(req.user, course)) throw new AppError('Not your course', 403);
  await Promise.all([Attempt.deleteMany({ quiz: quiz._id }), quiz.deleteOne()]);
  res.json({ message: 'Quiz deleted' });
});

// POST /api/quizzes/:id/attempt  (student) - automatic grading on the server
exports.submitAttempt = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw new AppError('Quiz not found', 404);
  if (!(await Enrollment.exists({ student: req.user._id, course: quiz.course }))) {
    throw new AppError('You are not enrolled in this course', 403);
  }
  const answers = req.body.answers;
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    throw new AppError('Provide one answer for every question', 400);
  }
  let score = 0;
  quiz.questions.forEach((q, i) => { if (answers[i] === q.correctIndex) score += 1; });
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  const attempt = await Attempt.create({
    student: req.user._id, quiz: quiz._id, course: quiz.course,
    answers, score, total, percentage, passed: percentage >= quiz.passPercentage,
  });
  res.status(201).json({ attempt, correctAnswers: quiz.questions.map((q) => q.correctIndex) });
});

// GET /api/quizzes/attempts/me?course=
exports.myAttempts = asyncHandler(async (req, res) => {
  const filter = { student: req.user._id };
  if (req.query.course) filter.course = req.query.course;
  const attempts = await Attempt.find(filter).populate('quiz', 'title').sort('-createdAt');
  res.json({ attempts });
});
