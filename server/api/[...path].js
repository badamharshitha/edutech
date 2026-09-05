import mongoose from 'mongoose';
import app from '../src/server.js';

let connectionPromise;

async function connectDatabase() {
  if (process.env.DEMO_MODE === 'true' || mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  connectionPromise ||= mongoose.connect(process.env.MONGODB_URI).catch(error => {
    connectionPromise = undefined;
    throw error;
  });
  await connectionPromise;
}

export default async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Database connection failed.' });
  }
}