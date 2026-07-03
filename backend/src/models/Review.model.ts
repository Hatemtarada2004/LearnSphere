import mongoose, { Document, Schema } from 'mongoose';
import { Course } from './Course.model';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Review must belong to a course'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ user: 1, course: 1 }, { unique: true });
ReviewSchema.index({ course: 1 });

// Recalculate course rating after save/delete
ReviewSchema.statics.calcAverageRatings = async function (courseId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: '$course',
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { rating: 0, totalRatings: 0 });
  }
};

ReviewSchema.post('save', async function () {
  await (this.constructor as any).calcAverageRatings(this.course);
});

ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await (this.constructor as any).calcAverageRatings(this.course);
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
