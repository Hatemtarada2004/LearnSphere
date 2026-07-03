import { body, param, query } from 'express-validator';

export const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),

  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
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
    ])
    .withMessage('Invalid category'),

  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate or advanced'),

  body('language').optional().trim(),
  body('requirements').optional().isArray(),
  body('whatYouLearn').optional().isArray(),
  body('tags').optional().isArray(),
];

export const updateCourseValidator = [
  body('title').optional().trim().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('shortDescription').optional().trim().isLength({ max: 300 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isIn([
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
  ]),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']),
];

export const createModuleValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Module title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('description').optional().trim().isLength({ max: 500 }),

  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
];

export const createLessonValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('videoUrl').optional().trim(),

  body('duration')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Duration must be non-negative'),

  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  body('isFree').optional().isBoolean(),
];

export const courseQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().trim(),
  query('level').optional().trim(),
  query('search').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sort').optional().isIn(['newest', 'oldest', 'price-asc', 'price-desc', 'rating', 'popular']),
];

export const reviewValidator = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];
