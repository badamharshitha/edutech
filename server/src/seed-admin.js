import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

let connected = false;
try {
  await mongoose.connect(process.env.MONGODB_URI);
  connected = true;
  if (await User.exists({ role: 'ADMIN' })) {
    console.log('An Admin account already exists. No account was created.');
  } else {
    const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';
    if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
    if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
    await User.create({ name: 'EduBridge Administrator', email, password: await bcrypt.hash(password, 10), role: 'ADMIN', status: 'ACTIVE', isVerified: true, profile: {} });
    console.log('Admin account created.');
  }
} finally {
  if (connected) await mongoose.disconnect();
}