const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signAccessToken } = require('../utils/jwt');
const { conflict, unauthorized, notFound, badRequest } = require('../utils/errors');

const publicUser = (u) => ({
  id: u.id,
  fullName: u.fullName,
  mobile: u.mobile,
  role: u.role,
  hospitalId: u.hospitalId,
  createdAt: u.createdAt,
});

const register = async (req, res, next) => {
  try {
    const { fullName, mobile, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { mobile } });
    if (existing) throw conflict('Mobile already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, mobile, passwordHash, role: 'PATIENT' },
    });

    const token = signAccessToken({ sub: user.id, role: user.role, hospitalId: null });
    return res.status(201).json({ user: publicUser(user), token });
  } catch (e) { return next(e); }
};

const login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.isActive) throw unauthorized('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw unauthorized('Invalid credentials');

    const token = signAccessToken({
      sub: user.id, role: user.role, hospitalId: user.hospitalId || null,
    });
    return res.json({ user: publicUser(user), token });
  } catch (e) { return next(e); }
};

const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw notFound('User not found');
    return res.json({ user: publicUser(user) });
  } catch (e) { return next(e); }
};

module.exports = { register, login, me };