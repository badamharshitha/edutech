import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['ADMIN', 'VOLUNTEER', 'SPONSOR'], required: true },
  status: { type: String, enum: ['ACTIVE', 'BLOCKED'], default: 'ACTIVE' },
  isVerified: { type: Boolean, default: false },
  profile: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  age: { type: Number, min: 1, max: 100 },
  gender: String,
  school: { type: String, required: true, trim: true },
  classCourse: String,
  academicPerformance: { type: Number, min: 0, max: 100 },
  familyIncome: { type: Number, min: 0, required: true },
  familySize: { type: Number, min: 1, max: 50, required: true },
  location: String,
  financialCondition: String,
  educationalNeed: String,
  supportCategory: { type: String, enum: ['Tuition Fee', 'Exam Fee', 'Study Materials', 'Transportation', 'Higher Education', 'Other Educational Support'], required: true },
  requiredAmount: { type: Number, min: 1, required: true },
  description: { type: String, maxlength: 2000 },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  needScore: { type: Number, min: 0, max: 100 },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
  aiExplanation: String,
  dropoutRisk: String,
  scoringVersion: String,
  analyzedAt: Date
}, { timestamps: true });

const supportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, min: 1, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SPONSORED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  notes: { type: String, maxlength: 2000 }
}, { timestamps: true });
supportSchema.index({ studentId: 1, status: 1 });
supportSchema.index({ sponsorId: 1, createdAt: -1 });

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  entityType: String,
  entityId: String,
  description: String,
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export const SupportRequest = mongoose.models.SupportRequest || mongoose.model('SupportRequest', supportSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);
