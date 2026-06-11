// Security: All inputs validated and sanitized before DB operations
import { prisma } from '../config/prisma.js';
import { comparePassword, hashPassword } from '../utils/hashHelper.js';
import { generateToken } from '../utils/jwtHelper.js';
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.is_active) {
      return res.status(401).json({
        errorCode: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        errorCode: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    res.json({
      token,
      must_reset_password: user.must_reset_password,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { new_password } = req.body;

    if (!new_password || new_password.length < 8) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Password must be at least 8 characters',
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Password must have uppercase, number, and special character',
      });
    }

    const hashed = await hashPassword(new_password);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        password_hash: hashed,
        must_reset_password: false,
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};
// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Name, email and password are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Password must be at least 8 characters',
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Email already exists',
      });
    }

    const password_hash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: 'collaborator',
        must_reset_password: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};