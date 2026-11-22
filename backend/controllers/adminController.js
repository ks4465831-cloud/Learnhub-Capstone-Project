const Course = require('../models/Course');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/courses?status=
exports.allCourses = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const courses = await Course.find(filter).populate('instructor', 'name email').sort('-createdAt');
  res.json({ courses });
});

// PATCH /api/admin/courses/:id/status   body: { status: approved | blocked | pending }
exports.setCourseStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'blocked', 'pending'].includes(status)) throw new AppError('Invalid status', 400);
  const course = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!course) throw new AppError('Course not found', 404);
  res.json({ course });
});

// GET /api/admin/users
exports.allUsers = asyncHandler(async (req, res) => {
  res.json({ users: await User.find().sort('-createdAt') });
});
