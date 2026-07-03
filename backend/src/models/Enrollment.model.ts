import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  paymentStatus: PaymentStatus;
  enrollmentDate: Date;
  progress: number;
  lastLesson?: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1 });
EnrollmentSchema.index({ course: 1 });

export const Enrollment = mongoose.model<IEnrollment>(
  'Enrollment',
  EnrollmentSchema
);
