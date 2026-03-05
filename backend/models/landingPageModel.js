const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channelName: { type: String, required: true, trim: true },
    channelTitle: { type: String, required: true, trim: true },
    subscribers: { type: Number, required: true, default: 0 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ctaText: { type: String, default: 'Join on Telegram' },
    channelLink: { type: String, required: true },
    description1: { type: String, required: true },
    description2: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    design: {
      type: String,
      enum: ['modern-blue', 'dark-rose', 'clean-minimal', 'ocean', 'crypto-minimal', 'neon-cyber', 'glassmorphism', 'gray-minimal', 'vibrant-gradient', 'serene-green', 'sunset'],
      default: 'modern-blue',
    },
    metaPixelId: { type: String, default: '' },
    googleTagId: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LandingPage', landingPageSchema);