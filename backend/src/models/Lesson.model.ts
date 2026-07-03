import mongoose, { Document, Schema } from 'mongoose';

export interface IResource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'code' | 'other';
}

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  title: string;
  videoUrl: string;
  duration: number;
  resources: IResource[];
  order: number;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['pdf', 'link', 'code', 'other'],
      default: 'link',
    },
  },
  { _id: false }
);

const LessonSchema = new Schema<ILesson>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Lesson must belong to a module'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    videoUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 0,
    },
    resources: [ResourceSchema],
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

LessonSchema.index({ module: 1, order: 1 });

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
