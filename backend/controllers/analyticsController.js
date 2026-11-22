const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/analytics/instructor
// Aggregation 1: enrolments per course   Aggregation 2: average quiz score per course
exports.instructorAnalytics = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).select('title status');
  const ids = courses.map((c) => c._id);

  const [enrolments, scores] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: ids } } },
      { $group: { _id: '$course', enrolments: { $sum: 1 } } },
    ]),
    Attempt.aggregate([
      { $match: { course: { $in: ids } } },
      { $group: { _id: '$course', avgScore: { $avg: '$percentage' }, attempts: { $sum: 1 }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
    ]),
  ]);
  const eMap = Object.fromEntries(enrolments.map((e) => [String(e._id), e]));
  const sMap = Object.fromEntries(scores.map((s) => [String(s._id), s]));

  const report = courses.map((c) => ({
    courseId: c._id,
    title: c.title,
    status: c.status,
    enrolments: eMap[String(c._id)]?.enrolments || 0,
    attempts: sMap[String(c._id)]?.attempts || 0,
    averageScore: sMap[String(c._id)] ? Math.round(sMap[String(c._id)].avgScore) : null,
    passRate: sMap[String(c._id)] ? Math.round((sMap[String(c._id)].passed / sMap[String(c._id)].attempts) * 100) : null,
  }));
  res.json({ report });
});

// GET /api/analytics/admin
exports.adminAnalytics = asyncHandler(async (req, res) => {
  const [usersByRole, coursesByStatus, topCourses] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Course.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Enrollment.aggregate([
      { $group: { _id: '$course', enrolments: { $sum: 1 } } },
      { $sort: { enrolments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { _id: 0, title: '$course.title', enrolments: 1 } },
    ]),
  ]);
  res.json({ usersByRole, coursesByStatus, topCourses });
});
