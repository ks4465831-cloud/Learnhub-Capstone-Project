const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/tokens');

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

const issueTokens = async (user, res, status = 200) => {
  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  res.status(status).json({ user: publicUser(user), accessToken, refreshToken });
};

// POST /api/auth/register  (admin cannot be self-registered)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const safeRole = ['student', 'instructor'].includes(role) ? role : 'student';
  const user = await User.create({ name, email, password, role: safeRole });
  await issueTokens(user, res, 201);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new AppError('Invalid email or password', 401);
  await issueTokens(user, res);
});

// POST /api/auth/refresh  (refresh-token rotation)
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);
  const decoded = verifyRefresh(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) throw new AppError('Refresh token is not valid', 401);
  await issueTokens(user, res);
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  req.user.refreshToken = undefined;
  await req.user.save({ validateBeforeSave: false });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
