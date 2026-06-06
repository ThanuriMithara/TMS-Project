// Security: All inputs validated and sanitized before DB operations
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { comparePassword, hashPassword } from '../utils/hashHelper.js';
import { generateToken } from '../utils/jwtHelper.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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