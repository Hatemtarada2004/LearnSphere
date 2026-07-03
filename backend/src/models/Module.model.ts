import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  _id: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Module must belong to a course'],
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ModuleSchema.index({ course: 1, order: 1 });

export const Module = mongoose.model<IModule>('Module', ModuleSchema);
