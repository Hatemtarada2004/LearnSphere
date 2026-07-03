import mongoose, { Document, Schema } from 'mongoose';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory =
  | 'development'
  | 'design'
  | 'business'
  | 'marketing'
  | 'photography'
  | 'music'
  | 'health'
  | 'finance'
  | 'language'
  | 'other';

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  thumbnail: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number;
  language: string;
  requirements: string[];
  whatYouLearn: string[];
  tags: string[];
  isPublished: boolean;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'development',
        'design',
        'business',
        'marketing',
        'photography',
        'music',
        'health',
        'finance',
        'language',
        'other',
      ],
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'English',
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    whatYouLearn: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CourseSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { language_override: 'spokenLanguage' }
);
CourseSchema.index({ category: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ isPublished: 1 });
CourseSchema.index({ rating: -1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ price: 1 });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
