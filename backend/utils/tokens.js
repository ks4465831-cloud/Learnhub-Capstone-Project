const jwt = require('jsonwebtoken');

exports.signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_EXPIRES || '15m' });
exports.signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || '7d' });
exports.verifyAccess = (t) => jwt.verify(t, process.env.JWT_ACCESS_SECRET);
exports.verifyRefresh = (t) => jwt.verify(t, process.env.JWT_REFRESH_SECRET);
