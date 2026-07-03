/**
 * LearnSphere — Comprehensive Seed Script
 * Run: node seed.js  (from /backend directory)
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/learnsphere';

// ── Schema re-declarations (kept minimal) ──────────────────────────────────

const UserSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  refreshToken: { type: String, select: false },
  lastLogin: Date,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const CourseSchema = new mongoose.Schema({
  title: String, description: String, shortDescription: String,
  price: Number, thumbnail: String,
  category: String, level: { type: String, default: 'beginner' },
  duration: { type: Number, default: 0 },
  language: { type: String, default: 'English' },
  requirements: [String], whatYouLearn: [String], tags: [String],
  isPublished: { type: Boolean, default: false },
  rating: { type: Number, default: 0 }, totalRatings: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const ModuleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: String, description: String,
  order: Number,
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  title: String, videoUrl: String, duration: Number,
  resources: [{ title: String, url: String, type: String }],
  order: Number, isFree: { type: Boolean, default: false },
}, { timestamps: true });

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  paymentStatus: { type: String, default: 'pending' },
  enrollmentDate: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  lastLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  completedAt: Date,
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  rating: Number, comment: String,
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  amount: Number,
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: String,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);
const Module = mongoose.model('Module', ModuleSchema);
const Lesson = mongoose.model('Lesson', LessonSchema);
const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Payment = mongoose.model('Payment', PaymentSchema);

// ── Helpers ────────────────────────────────────────────────────────────────

async function hashPw(pw) {
  return bcrypt.hash(pw, 12);
}

// Thumbnails from Unsplash (reliable CDN for demos)
const thumbs = {
  development: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format',
  design:      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format',
  business:    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format',
  marketing:   'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&auto=format',
  photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format',
  music:       'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format',
  health:      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format',
  finance:     'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format',
  language:    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format',
  react:       'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format',
  nodejs:      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format',
  python:      'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&auto=format',
};

// Sample YouTube embeds (public educational content)
const videos = {
  intro:    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  react1:   'https://www.youtube.com/embed/SqcY0GlETPk',
  react2:   'https://www.youtube.com/embed/Ke90Tje7VS0',
  node1:    'https://www.youtube.com/embed/TlB_eWDSMt4',
  python1:  'https://www.youtube.com/embed/rfscVS0vtbw',
  design1:  'https://www.youtube.com/embed/c9Wg6Cb_YlU',
  biz1:     'https://www.youtube.com/embed/4xyMqW9PDGs',
  photo1:   'https://www.youtube.com/embed/1AvBDh10_Lc',
  music1:   'https://www.youtube.com/embed/ziNR4CrGrBM',
  finance1: 'https://www.youtube.com/embed/s2VKFmVMiuA',
  lang1:    'https://www.youtube.com/embed/U8V_LsyGHTI',
};

// ── Seed Data Definitions ──────────────────────────────────────────────────

const USERS_SEED = [
  { firstName: 'Ahmad', lastName: 'Hassan', email: 'ahmad@test.com',    password: 'Test@1234', role: 'student', isVerified: true,  bio: 'Software enthusiast learning to code.' },
  { firstName: 'Ahmad', lastName: 'Karimi', email: 'ahmad2@test.com',   password: 'Test@1234', role: 'student', isVerified: true,  bio: 'Aspiring full-stack developer.' },
  { firstName: 'Sara',  lastName: 'Admin',  email: 'sara@test.com',     password: 'Admin@1234', role: 'admin', isVerified: true,  bio: 'Platform administrator.' },
  { firstName: 'Layla', lastName: 'Nasser', email: 'layla@test.com',    password: 'Test@1234', role: 'student', isVerified: true,  bio: 'UX designer by day, coder by night.' },
  { firstName: 'Omar',  lastName: 'Farouk', email: 'omar@test.com',     password: 'Test@1234', role: 'student', isVerified: true,  bio: 'Entrepreneur building the next big startup.' },
  { firstName: 'Nour',  lastName: 'Al-Din', email: 'nour@test.com',     password: 'Test@1234', role: 'student', isVerified: false, bio: 'Photography hobbyist exploring digital arts.' },
  { firstName: 'Youssef', lastName: 'Mansour', email: 'youssef@test.com', password: 'Test@1234', role: 'student', isVerified: true, bio: 'Finance professional upgrading skills.' },
];

const COURSES_SEED = [
  // ── 1. React 18 ────────────────────────────────────────────────────────
  {
    _tag: 'react',
    title: 'Complete React 18 Course',
    shortDescription: 'Master modern React with hooks, context, performance patterns and real-world projects.',
    description: 'This comprehensive course covers everything you need to know about React 18 — from the very basics to advanced concepts. You will learn JSX, functional components, hooks (useState, useEffect, useCallback, useMemo, useRef, useReducer), Context API, React Router v6, TanStack Query, and modern performance optimization patterns. By the end of the course you will have built three real-world applications you can put in your portfolio.',
    price: 1999, category: 'development', level: 'beginner',
    thumbnail: thumbs.react,
    language: 'English',
    requirements: ['Basic JavaScript knowledge', 'HTML & CSS fundamentals'],
    whatYouLearn: ['Build real-world React apps', 'Master all React hooks', 'State management patterns', 'React Router v6', 'Performance optimization', 'Deploy React apps'],
    tags: ['react', 'javascript', 'frontend', 'hooks', 'web development'],
    isPublished: true, rating: 4.8, totalRatings: 3, totalStudents: 3,
    modules: [
      {
        title: 'Getting Started with React',
        description: 'Setup your environment and understand the core concepts.',
        order: 0,
        lessons: [
          { title: 'What is React? Why use it?', duration: 12, order: 0, isFree: true,  videoUrl: videos.react1 },
          { title: 'Setting Up the Environment', duration: 18, order: 1, isFree: false, videoUrl: videos.react2 },
          { title: 'Your First React Component',  duration: 20, order: 2, isFree: false, videoUrl: videos.intro },
        ],
      },
      {
        title: 'React Hooks Deep Dive',
        description: 'Master all built-in hooks with practical examples.',
        order: 1,
        lessons: [
          { title: 'useState and useEffect',            duration: 25, order: 0, isFree: true,  videoUrl: videos.react1 },
          { title: 'useCallback and useMemo',           duration: 22, order: 1, isFree: false, videoUrl: videos.react2 },
          { title: 'useRef and useReducer',             duration: 20, order: 2, isFree: false, videoUrl: videos.intro },
          { title: 'Custom Hooks — Reusability Pattern',duration: 28, order: 3, isFree: false, videoUrl: videos.react1 },
        ],
      },
      {
        title: 'Building Real-World Apps',
        description: 'Apply everything in three portfolio-ready projects.',
        order: 2,
        lessons: [
          { title: 'Project 1 — Task Manager App', duration: 45, order: 0, isFree: false, videoUrl: videos.react2 },
          { title: 'Project 2 — E-Commerce Shop',  duration: 60, order: 1, isFree: false, videoUrl: videos.intro },
          { title: 'Deploy to Vercel / Netlify',   duration: 15, order: 2, isFree: false, videoUrl: videos.react1 },
        ],
      },
    ],
  },
  // ── 2. Node.js ──────────────────────────────────────────────────────────
  {
    _tag: 'nodejs',
    title: 'Node.js & Express Backend Development',
    shortDescription: 'Build scalable REST APIs with Node.js, Express, MongoDB and JWT authentication.',
    description: 'Learn backend development from scratch using Node.js and Express. This course covers HTTP fundamentals, REST API design, authentication with JWT, database modeling with MongoDB/Mongoose, file uploads, email services, error handling, and deployment to production. Perfect for front-end developers wanting to go full-stack.',
    price: 2499, category: 'development', level: 'intermediate',
    thumbnail: thumbs.nodejs,
    language: 'English',
    requirements: ['JavaScript ES6+', 'Basic understanding of HTTP'],
    whatYouLearn: ['Build REST APIs with Express', 'JWT authentication', 'MongoDB & Mongoose', 'File uploads', 'Email services', 'Production deployment'],
    tags: ['nodejs', 'express', 'backend', 'mongodb', 'api', 'javascript'],
    isPublished: true, rating: 4.6, totalRatings: 2, totalStudents: 2,
    modules: [
      {
        title: 'Node.js Foundations',
        description: 'Core Node.js concepts every developer must know.',
        order: 0,
        lessons: [
          { title: 'How Node.js Works Internally', duration: 18, order: 0, isFree: true,  videoUrl: videos.node1 },
          { title: 'Modules, npm & Package Management', duration: 22, order: 1, isFree: false, videoUrl: videos.intro },
          { title: 'File System & Streams', duration: 20, order: 2, isFree: false, videoUrl: videos.node1 },
        ],
      },
      {
        title: 'Express & REST APIs',
        description: 'Build production-quality APIs.',
        order: 1,
        lessons: [
          { title: 'Express Setup & Middleware', duration: 20, order: 0, isFree: true,  videoUrl: videos.node1 },
          { title: 'CRUD with MongoDB',           duration: 30, order: 1, isFree: false, videoUrl: videos.intro },
          { title: 'JWT Auth & Refresh Tokens',   duration: 35, order: 2, isFree: false, videoUrl: videos.node1 },
          { title: 'Error Handling & Validation', duration: 25, order: 3, isFree: false, videoUrl: videos.intro },
        ],
      },
    ],
  },
  // ── 3. Python ───────────────────────────────────────────────────────────
  {
    _tag: 'python',
    title: 'Python for Data Science & Machine Learning',
    shortDescription: 'Learn Python, NumPy, Pandas, Matplotlib and build your first ML models.',
    description: 'A hands-on course covering Python programming fundamentals and its data science ecosystem. You will master NumPy arrays, Pandas DataFrames, data visualization with Matplotlib & Seaborn, and build real machine learning models using Scikit-learn. No prior programming experience needed.',
    price: 2999, category: 'development', level: 'beginner',
    thumbnail: thumbs.python,
    language: 'English',
    requirements: ['No prior experience needed', 'A computer with internet'],
    whatYouLearn: ['Python fundamentals', 'Data manipulation with Pandas', 'Data visualization', 'Machine learning basics', 'Real datasets', 'Jupyter notebooks'],
    tags: ['python', 'data science', 'machine learning', 'pandas', 'numpy'],
    isPublished: true, rating: 4.7, totalRatings: 1, totalStudents: 1,
    modules: [
      {
        title: 'Python Essentials',
        description: 'All the Python you need to start with data science.',
        order: 0,
        lessons: [
          { title: 'Python Variables & Data Types',  duration: 15, order: 0, isFree: true,  videoUrl: videos.python1 },
          { title: 'Control Flow & Functions',       duration: 20, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Lists, Dicts, Comprehensions',   duration: 18, order: 2, isFree: false, videoUrl: videos.python1 },
        ],
      },
      {
        title: 'Data Analysis with Pandas',
        description: 'Explore and analyze real-world datasets.',
        order: 1,
        lessons: [
          { title: 'Intro to Pandas — Series & DataFrame', duration: 25, order: 0, isFree: true,  videoUrl: videos.python1 },
          { title: 'Data Cleaning & Transformation',       duration: 30, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Visualization with Matplotlib',        duration: 22, order: 2, isFree: false, videoUrl: videos.python1 },
        ],
      },
    ],
  },
  // ── 4. UX/UI Design ─────────────────────────────────────────────────────
  {
    _tag: 'design',
    title: 'UI/UX Design Fundamentals with Figma',
    shortDescription: 'Learn the principles of great design and build stunning interfaces with Figma.',
    description: 'Start your design journey by mastering core UI/UX principles: typography, color theory, layout grids, accessibility, and user research. Learn Figma from scratch — components, auto-layout, prototyping, and handoff. Build a full design system and three app prototypes for your portfolio.',
    price: 1799, category: 'design', level: 'beginner',
    thumbnail: thumbs.design,
    language: 'English',
    requirements: ['No design experience needed', 'Download Figma (free)'],
    whatYouLearn: ['Design principles', 'Color theory & typography', 'Figma proficiency', 'Build design systems', 'Prototype & handoff', 'User research basics'],
    tags: ['figma', 'ui', 'ux', 'design', 'prototyping'],
    isPublished: true, rating: 4.9, totalRatings: 2, totalStudents: 2,
    modules: [
      {
        title: 'Design Principles',
        description: 'The theory behind beautiful, usable design.',
        order: 0,
        lessons: [
          { title: 'What Makes Good Design?',    duration: 14, order: 0, isFree: true,  videoUrl: videos.design1 },
          { title: 'Color Theory & Psychology',  duration: 18, order: 1, isFree: false, videoUrl: videos.intro   },
          { title: 'Typography Fundamentals',    duration: 16, order: 2, isFree: false, videoUrl: videos.design1 },
        ],
      },
      {
        title: 'Figma Mastery',
        description: 'Professional Figma skills from zero to hero.',
        order: 1,
        lessons: [
          { title: 'Figma Interface Tour',        duration: 12, order: 0, isFree: true,  videoUrl: videos.design1 },
          { title: 'Auto-Layout & Components',    duration: 28, order: 1, isFree: false, videoUrl: videos.intro   },
          { title: 'Prototyping & Interactions',  duration: 22, order: 2, isFree: false, videoUrl: videos.design1 },
          { title: 'Building a Design System',    duration: 35, order: 3, isFree: false, videoUrl: videos.intro   },
        ],
      },
    ],
  },
  // ── 5. Digital Marketing ─────────────────────────────────────────────────
  {
    _tag: 'marketing',
    title: 'Digital Marketing Mastery',
    shortDescription: 'Master SEO, social media, email marketing, and paid ads to grow any business online.',
    description: 'A complete digital marketing course covering every channel and tactic modern marketers use. From SEO and content marketing to Facebook/Google Ads, email automation, and analytics — you will leave with a complete marketing toolkit and actionable strategies you can apply immediately.',
    price: 1499, category: 'marketing', level: 'beginner',
    thumbnail: thumbs.marketing,
    language: 'English',
    requirements: ['No prior marketing knowledge needed'],
    whatYouLearn: ['SEO fundamentals', 'Social media strategy', 'Google & Facebook Ads', 'Email marketing automation', 'Google Analytics', 'Content marketing'],
    tags: ['seo', 'marketing', 'social media', 'ads', 'email marketing'],
    isPublished: true, rating: 4.5, totalRatings: 1, totalStudents: 1,
    modules: [
      {
        title: 'Digital Marketing Overview',
        description: 'Understand the full digital marketing landscape.',
        order: 0,
        lessons: [
          { title: 'The Digital Marketing Ecosystem', duration: 16, order: 0, isFree: true,  videoUrl: videos.biz1 },
          { title: 'SEO — Search Engine Optimization', duration: 28, order: 1, isFree: false, videoUrl: videos.intro },
          { title: 'Content Marketing Strategy',       duration: 22, order: 2, isFree: false, videoUrl: videos.biz1 },
        ],
      },
      {
        title: 'Paid Advertising',
        description: 'Run profitable ad campaigns on Google and Meta.',
        order: 1,
        lessons: [
          { title: 'Google Ads — Search Campaigns', duration: 30, order: 0, isFree: false, videoUrl: videos.biz1   },
          { title: 'Facebook & Instagram Ads',      duration: 28, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Analytics & Attribution',       duration: 20, order: 2, isFree: false, videoUrl: videos.biz1   },
        ],
      },
    ],
  },
  // ── 6. Photography ──────────────────────────────────────────────────────
  {
    _tag: 'photo',
    title: 'Photography Masterclass — Zero to Hero',
    shortDescription: 'Learn camera settings, composition, lighting, and editing in Lightroom.',
    description: 'Understand your camera fully — aperture, shutter speed, ISO, and exposure triangle — then apply that knowledge in the field. Learn composition rules, portrait lighting, landscape photography, and professional editing workflows in Adobe Lightroom. Includes 12 shooting assignments.',
    price: 1299, category: 'photography', level: 'beginner',
    thumbnail: thumbs.photography,
    language: 'English',
    requirements: ['Any camera (DSLR, mirrorless, or phone)', 'No prior photography experience'],
    whatYouLearn: ['Camera controls mastery', 'Exposure triangle', 'Composition techniques', 'Portrait photography', 'Landscape photography', 'Lightroom editing'],
    tags: ['photography', 'lightroom', 'camera', 'editing', 'portrait'],
    isPublished: true, rating: 4.7, totalRatings: 1, totalStudents: 1,
    modules: [
      {
        title: 'Camera Fundamentals',
        description: 'Get full control of your camera.',
        order: 0,
        lessons: [
          { title: 'Understanding the Exposure Triangle', duration: 20, order: 0, isFree: true,  videoUrl: videos.photo1 },
          { title: 'Aperture, Depth of Field',            duration: 18, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Shutter Speed & Motion',              duration: 15, order: 2, isFree: false, videoUrl: videos.photo1 },
        ],
      },
      {
        title: 'Composition & Editing',
        description: 'Take better photos and make them shine in post.',
        order: 1,
        lessons: [
          { title: 'Rule of Thirds & Leading Lines', duration: 16, order: 0, isFree: true,  videoUrl: videos.photo1 },
          { title: 'Lightroom Editing Workflow',     duration: 35, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Color Grading & Presets',        duration: 25, order: 2, isFree: false, videoUrl: videos.photo1 },
        ],
      },
    ],
  },
  // ── 7. Business ─────────────────────────────────────────────────────────
  {
    _tag: 'business',
    title: 'Business Strategy & Entrepreneurship',
    shortDescription: 'Validate ideas, build business models, and launch your startup with confidence.',
    description: 'Whether you are starting your first business or scaling an existing one, this course gives you the strategic frameworks and practical tools to succeed. Covers lean startup methodology, business model canvas, market research, financial modeling, fundraising basics, and growth strategies.',
    price: 1999, category: 'business', level: 'intermediate',
    thumbnail: thumbs.business,
    language: 'English',
    requirements: ['Basic business awareness helpful but not required'],
    whatYouLearn: ['Lean startup methodology', 'Business Model Canvas', 'Market research', 'Financial modeling', 'Fundraising basics', 'Growth hacking'],
    tags: ['startup', 'entrepreneurship', 'business strategy', 'lean startup', 'bmc'],
    isPublished: true, rating: 4.4, totalRatings: 1, totalStudents: 1,
    modules: [
      {
        title: 'Idea Validation',
        description: 'Turn your idea into a tested concept before spending a dollar.',
        order: 0,
        lessons: [
          { title: 'Finding & Validating Your Idea', duration: 22, order: 0, isFree: true,  videoUrl: videos.biz1  },
          { title: 'Customer Interviews & Research', duration: 20, order: 1, isFree: false, videoUrl: videos.intro },
          { title: 'Business Model Canvas Workshop', duration: 28, order: 2, isFree: false, videoUrl: videos.biz1  },
        ],
      },
      {
        title: 'Launch & Growth',
        description: 'Go from zero to first 100 customers.',
        order: 1,
        lessons: [
          { title: 'MVP — Build Only What Matters', duration: 18, order: 0, isFree: false, videoUrl: videos.biz1   },
          { title: 'Growth Channels & CAC',          duration: 25, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Fundraising 101',                duration: 22, order: 2, isFree: false, videoUrl: videos.biz1   },
        ],
      },
    ],
  },
  // ── 8. Finance ──────────────────────────────────────────────────────────
  {
    _tag: 'finance',
    title: 'Personal Finance & Investment Fundamentals',
    shortDescription: 'Take control of your money — budgeting, investing, stocks, and building wealth.',
    description: 'A practical, jargon-free guide to personal finance. Build a budget that works, eliminate debt, start investing in the stock market with confidence, understand index funds and ETFs, and create a long-term wealth-building plan. Includes downloadable worksheets and calculators.',
    price: 999, category: 'finance', level: 'beginner',
    thumbnail: thumbs.finance,
    language: 'English',
    requirements: ['No financial background needed'],
    whatYouLearn: ['Budgeting & debt payoff', 'Stock market basics', 'Index fund investing', 'Compound interest', 'Emergency fund', 'Long-term wealth building'],
    tags: ['finance', 'investing', 'stocks', 'budgeting', 'personal finance'],
    isPublished: true, rating: 4.6, totalRatings: 2, totalStudents: 2,
    modules: [
      {
        title: 'Money Foundations',
        description: 'Understand where your money goes and how to control it.',
        order: 0,
        lessons: [
          { title: 'The Wealth Mindset',         duration: 14, order: 0, isFree: true,  videoUrl: videos.finance1 },
          { title: 'Budgeting That Actually Works', duration: 20, order: 1, isFree: false, videoUrl: videos.intro    },
          { title: 'Eliminating Debt Fast',       duration: 18, order: 2, isFree: false, videoUrl: videos.finance1 },
        ],
      },
      {
        title: 'Investing Basics',
        description: 'Make your money work for you.',
        order: 1,
        lessons: [
          { title: 'Stock Market 101',          duration: 22, order: 0, isFree: true,  videoUrl: videos.finance1 },
          { title: 'Index Funds vs. ETFs',      duration: 18, order: 1, isFree: false, videoUrl: videos.intro    },
          { title: 'Building a Long-Term Portfolio', duration: 25, order: 2, isFree: false, videoUrl: videos.finance1 },
        ],
      },
    ],
  },
  // ── 9. Music ────────────────────────────────────────────────────────────
  {
    _tag: 'music',
    title: 'Music Production for Beginners (FL Studio)',
    shortDescription: 'Produce professional-sounding tracks from scratch using FL Studio.',
    description: 'Learn music production from the ground up using FL Studio. This course covers the DAW interface, beat making, melody writing, mixing, mastering, and publishing your music. No prior musical knowledge required — just a passion for music.',
    price: 1499, category: 'music', level: 'beginner',
    thumbnail: thumbs.music,
    language: 'English',
    requirements: ['Download FL Studio (free trial available)', 'Headphones or speakers'],
    whatYouLearn: ['FL Studio interface', 'Beat programming', 'Melody & chord progressions', 'Mixing fundamentals', 'Mastering basics', 'Publish on Spotify'],
    tags: ['music production', 'fl studio', 'beats', 'mixing', 'daw'],
    isPublished: true, rating: 4.3, totalRatings: 0, totalStudents: 0,
    modules: [
      {
        title: 'Getting Started in FL Studio',
        description: 'Learn the interface and make your first beat.',
        order: 0,
        lessons: [
          { title: 'FL Studio Tour & Setup', duration: 18, order: 0, isFree: true,  videoUrl: videos.music1 },
          { title: 'Your First Beat',        duration: 25, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Melody Writing Basics',  duration: 22, order: 2, isFree: false, videoUrl: videos.music1 },
        ],
      },
    ],
  },
  // ── 10. Spanish ──────────────────────────────────────────────────────────
  {
    _tag: 'spanish',
    title: 'Spanish for Beginners — Complete A1-A2 Course',
    shortDescription: 'Speak basic conversational Spanish with confidence from day one.',
    description: 'This course teaches Spanish through natural conversation — not boring grammar drills. You will learn essential vocabulary, pronounciation, everyday phrases, and grammar structures through fun, practical exercises. Audio-rich lessons with native speaker recordings.',
    price: 799, category: 'language', level: 'beginner',
    thumbnail: thumbs.language,
    language: 'Spanish',
    requirements: ['No prior Spanish knowledge needed'],
    whatYouLearn: ['Greetings & introductions', 'Numbers, dates & time', 'Restaurant & shopping vocabulary', 'Describing people & places', 'Present & past tense', 'Travel conversations'],
    tags: ['spanish', 'language learning', 'beginner', 'conversation'],
    isPublished: true, rating: 4.5, totalRatings: 0, totalStudents: 0,
    modules: [
      {
        title: 'Spanish Basics',
        description: 'Foundations every Spanish learner needs.',
        order: 0,
        lessons: [
          { title: 'Greetings & Introductions',  duration: 12, order: 0, isFree: true,  videoUrl: videos.lang1 },
          { title: 'Numbers 1–100 & Dates',       duration: 15, order: 1, isFree: false, videoUrl: videos.intro  },
          { title: 'Everyday Phrases',            duration: 18, order: 2, isFree: false, videoUrl: videos.lang1  },
        ],
      },
    ],
  },
];

// ── Enrollment + Review plan ───────────────────────────────────────────────
// Defined after courses are created (uses IDs).  Map: [userEmail, courseTag, progress, completedFraction, reviewRating, reviewComment]
const ENROLLMENT_PLAN = [
  // Ahmad Hassan
  ['ahmad@test.com',    'react',     75, 0.75, 5, 'Absolutely brilliant course! The hooks section alone was worth the price. Highly recommend to anyone learning React.'],
  ['ahmad@test.com',    'nodejs',    40, 0.40, 4, 'Very well structured. Great real-world examples. Would love more coverage of microservices.'],
  ['ahmad@test.com',    'finance',   60, 0.60, null, null],
  // Ahmad Karimi
  ['ahmad2@test.com',   'react',    100, 1.00, 5, 'Best React course I have ever taken. The project-based approach made it click for me.'],
  ['ahmad2@test.com',   'design',    55, 0.55, 5, 'Outstanding! Layla (the instructor) explains Figma so intuitively. My portfolio has never looked better.'],
  // Layla Nasser
  ['layla@test.com',    'design',    90, 0.90, 5, 'Perfect course for someone transitioning into UX. Loved the design system module!'],
  ['layla@test.com',    'nodejs',    30, 0.30, null, null],
  // Omar Farouk
  ['omar@test.com',     'business',  80, 0.80, 4, 'Very actionable content. The BMC workshop section was a real eye-opener for my startup.'],
  ['omar@test.com',     'marketing', 50, 0.50, 5, 'Packed with value. The ads section alone doubled my campaign ROI.'],
  // Youssef Mansour
  ['youssef@test.com',  'finance',  100, 1.00, 5, 'This course changed my relationship with money. Already started my index fund portfolio!'],
  ['youssef@test.com',  'python',    45, 0.45, null, null],
  // Nour Al-Din
  ['nour@test.com',     'photo',     70, 0.70, 5, 'The Lightroom workflow section is pure gold. My photography went from snapshots to pro shots in weeks!'],
];

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // ── 1. Upsert Users ────────────────────────────────────────────────────
  console.log('\n── Users ──────────────────────────────────────────────────');
  const userMap = {}; // email → user doc
  for (const u of USERS_SEED) {
    let user = await User.findOne({ email: u.email }).select('+password');
    if (!user) {
      const hashed = await hashPw(u.password);
      user = await User.create({
        firstName: u.firstName, lastName: u.lastName,
        email: u.email, password: hashed,
        role: u.role, isVerified: u.isVerified, bio: u.bio,
      });
      console.log(`  CREATED  ${u.email}  [${u.role}]`);
    } else {
      // Ensure isVerified and role are correct
      await User.updateOne({ _id: user._id }, { isVerified: u.isVerified, role: u.role, bio: u.bio });
      console.log(`  EXISTS   ${u.email}  (ensured role=${u.role}, isVerified=${u.isVerified})`);
    }
    userMap[u.email] = await User.findOne({ email: u.email });
  }

  const admin = userMap['sara@test.com'];

  // ── 2. Rebuild Courses ────────────────────────────────────────────────
  console.log('\n── Courses ─────────────────────────────────────────────────');

  // Delete all existing courses + their modules/lessons/enrollments/reviews
  const existingCourses = await Course.find({});
  for (const c of existingCourses) {
    const mods = await Module.find({ course: c._id });
    const modIds = mods.map(m => m._id);
    await Lesson.deleteMany({ module: { $in: modIds } });
    await Module.deleteMany({ course: c._id });
    await Enrollment.deleteMany({ course: c._id });
    await Review.deleteMany({ course: c._id });
    await Payment.deleteMany({ course: c._id });
    await c.deleteOne();
  }
  console.log(`  Cleared ${existingCourses.length} existing courses`);

  const courseMap = {}; // _tag → {course, lessons[]}
  for (const cs of COURSES_SEED) {
    const course = await Course.create({
      title: cs.title, description: cs.description,
      shortDescription: cs.shortDescription, price: cs.price,
      category: cs.category, level: cs.level,
      thumbnail: cs.thumbnail, language: cs.language,
      requirements: cs.requirements, whatYouLearn: cs.whatYouLearn,
      tags: cs.tags, isPublished: cs.isPublished,
      rating: cs.rating, totalRatings: cs.totalRatings,
      totalStudents: cs.totalStudents, createdBy: admin._id,
    });
    console.log(`  CREATED  "${cs.title}"`);

    const allLessons = [];
    let totalDuration = 0;
    for (const ms of cs.modules) {
      const mod = await Module.create({
        course: course._id, title: ms.title,
        description: ms.description, order: ms.order,
      });
      for (const ls of ms.lessons) {
        const lesson = await Lesson.create({
          module: mod._id, title: ls.title,
          videoUrl: ls.videoUrl, duration: ls.duration,
          order: ls.order, isFree: ls.isFree,
        });
        allLessons.push(lesson);
        totalDuration += ls.duration;
      }
    }
    await Course.findByIdAndUpdate(course._id, { duration: totalDuration });
    courseMap[cs._tag] = { course, lessons: allLessons };
  }

  // ── 3. Enrollments, Progress & Reviews ────────────────────────────────
  console.log('\n── Enrollments & Reviews ───────────────────────────────────');
  for (const [email, tag, progress, fraction, reviewRating, reviewComment] of ENROLLMENT_PLAN) {
    const user = userMap[email];
    const entry = courseMap[tag];
    if (!user || !entry) { console.log(`  SKIP  ${email}/${tag} — not found`); continue; }

    const { course, lessons } = entry;

    // Create a fake payment record
    const payment = await Payment.create({
      user: user._id, course: course._id,
      amount: course.price,
      razorpayOrderId: `order_seed_${user._id}_${course._id}`,
      razorpayPaymentId: `pay_seed_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: 'paid',
    });

    // Determine completed lessons based on fraction
    const lessonCount = Math.round(lessons.length * fraction);
    const completedLessons = lessons.slice(0, lessonCount).map(l => l._id);
    const lastLesson = completedLessons.length > 0 ? completedLessons[completedLessons.length - 1] : undefined;

    await Enrollment.create({
      student: user._id, course: course._id,
      paymentStatus: 'completed',
      enrollmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      progress, completedLessons, lastLesson,
      completedAt: progress === 100 ? new Date() : undefined,
    });

    console.log(`  ENROLLED ${email} → "${course.title}" (${progress}%)`);

    // Review
    if (reviewRating && reviewComment) {
      await Review.create({
        user: user._id, course: course._id,
        rating: reviewRating, comment: reviewComment,
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      });
      console.log(`  REVIEW   ${email} → "${course.title}" ⭐${reviewRating}`);
    }
  }

  // ── 4. Recalculate ratings ──────────────────────────────────────────────
  console.log('\n── Recalculating ratings ───────────────────────────────────');
  for (const tag of Object.keys(courseMap)) {
    const { course } = courseMap[tag];
    const stats = await Review.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const enrollCount = await Enrollment.countDocuments({ course: course._id, paymentStatus: 'completed' });
    if (stats.length > 0) {
      await Course.findByIdAndUpdate(course._id, {
        rating: Math.round(stats[0].avg * 10) / 10,
        totalRatings: stats[0].count,
        totalStudents: enrollCount,
      });
      console.log(`  ${course.title}: ⭐${Math.round(stats[0].avg * 10) / 10} (${stats[0].count} reviews, ${enrollCount} students)`);
    } else {
      await Course.findByIdAndUpdate(course._id, { totalStudents: enrollCount });
      console.log(`  ${course.title}: no reviews yet (${enrollCount} students)`);
    }
  }

  // ── 5. Wishlist ─────────────────────────────────────────────────────────
  console.log('\n── Wishlists ───────────────────────────────────────────────');
  const wishlistPlan = [
    ['ahmad@test.com',   ['python', 'design']],
    ['layla@test.com',   ['react', 'marketing']],
    ['omar@test.com',    ['finance', 'python']],
    ['nour@test.com',    ['music', 'spanish']],
    ['youssef@test.com', ['nodejs', 'business']],
  ];
  for (const [email, tags] of wishlistPlan) {
    const user = userMap[email];
    const courseIds = tags.map(t => courseMap[t]?.course._id).filter(Boolean);
    await User.findByIdAndUpdate(user._id, { wishlist: courseIds });
    console.log(`  WISHLIST ${email} → [${tags.join(', ')}]`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const counts = {
    users:       await User.countDocuments(),
    courses:     await Course.countDocuments({ isPublished: true }),
    modules:     await Module.countDocuments(),
    lessons:     await Lesson.countDocuments(),
    enrollments: await Enrollment.countDocuments({ paymentStatus: 'completed' }),
    reviews:     await Review.countDocuments(),
    payments:    await Payment.countDocuments({ status: 'paid' }),
  };

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  LearnSphere Seed Complete!');
  console.log('═══════════════════════════════════════════════════════');
  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.padEnd(14)} ${v}`));
  console.log('\n  Admin login:   sara@test.com   / Admin@1234');
  console.log('  Student login: ahmad@test.com  / Test@1234');
  console.log('  Student login: layla@test.com  / Test@1234');
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
