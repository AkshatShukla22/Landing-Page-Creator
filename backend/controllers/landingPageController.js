const LandingPage = require('../models/landingPageModel');
// No cloudinary import needed — uploads happen directly from frontend

// @desc  Get all landing pages for user
// @route GET /api/landing
const getLandingPages = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const pages = await LandingPage.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: pages.length, pages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single landing page
// @route GET /api/landing/:id
const getLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id).populate('user', 'name email');
    if (!page) return res.status(404).json({ message: 'Landing page not found' });
    if (req.user.role !== 'admin' && page.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get landing page by slug (public)
// @route GET /api/landing/slug/:slug
const getLandingPageBySlug = async (req, res) => {
  try {
    const page = await LandingPage.findOne({ slug: req.params.slug, status: 'active' });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    page.views += 1;
    await page.save();
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Check slug availability
// @route GET /api/landing/check-slug/:slug
const checkSlug = async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const exists = await LandingPage.findOne({ slug });
    res.json({ available: !exists, slug });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Generate slug suggestion
// @route POST /api/landing/generate-slug
const generateSlugSuggestion = async (req, res) => {
  try {
    const { channelName } = req.body;
    if (!channelName) return res.status(400).json({ message: 'Channel name required' });
    let slug = channelName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    const exists = await LandingPage.findOne({ slug });
    if (exists) slug = slug + '-' + Math.random().toString(36).substring(2, 6);
    res.json({ success: true, slug });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create landing page
// @route POST /api/landing
const createLandingPage = async (req, res) => {
  try {
    const {
      channelName, channelTitle, subscribers, slug, ctaText,
      channelLink, description1, description2,
      design, metaPixelId, googleTagId, status,
      logoUrl,  // comes as a Cloudinary URL already uploaded from frontend
    } = req.body;

    // Check approval
    const requestingUser = await require("../models/userModel").findById(req.user._id);
    if (requestingUser && !requestingUser.isApproved && requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Your account is pending approval. Please wait for admin to approve your account before creating landing pages." });
    }

    if (!channelName || !channelTitle || !subscribers || !slug || !channelLink || !description1) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const slugExists = await LandingPage.findOne({ slug: slug.toLowerCase() });
    if (slugExists) return res.status(400).json({ message: 'Slug already taken, please choose another' });

    if (metaPixelId && !/^\d{15,16}$/.test(metaPixelId)) {
      return res.status(400).json({ message: 'Meta Pixel ID must be 15-16 digits' });
    }
    if (googleTagId && !/^G-[A-Z0-9]+$/i.test(googleTagId)) {
      return res.status(400).json({ message: 'Google Tag ID must be in format G-XXXXXXXXXX' });
    }

    const page = await LandingPage.create({
      user: req.user._id,
      channelName, channelTitle,
      subscribers: parseInt(subscribers),
      slug: slug.toLowerCase(),
      ctaText: ctaText || 'Join on Telegram',
      channelLink, description1, description2: description2 || '',
      logoUrl: logoUrl || '',
      design: design || 'modern-blue',
      metaPixelId: metaPixelId || '',
      googleTagId: googleTagId || '',
      status: status || 'active',
    });

    res.status(201).json({ success: true, page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update landing page
// @route PUT /api/landing/:id
const updateLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && page.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.slug && req.body.slug !== page.slug) {
      const slugExists = await LandingPage.findOne({ slug: req.body.slug.toLowerCase() });
      if (slugExists) return res.status(400).json({ message: 'Slug already taken' });
    }

    // Remove base64 fields — not stored in DB
    delete req.body.logoBase64;

    const updated = await LandingPage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, page: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete landing page
// @route DELETE /api/landing/:id
const deleteLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && page.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await page.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get stats for current user
// @route GET /api/landing/stats
const getStats = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const pages = await LandingPage.find(filter);
    const totalPages = pages.length;
    const totalViews = pages.reduce((acc, p) => acc + p.views, 0);
    const avgViews = totalPages ? Math.round(totalViews / totalPages) : 0;
    res.json({ success: true, totalPages, totalViews, avgViews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getLandingPages, getLandingPage, getLandingPageBySlug,
  checkSlug, generateSlugSuggestion,
  createLandingPage, updateLandingPage, deleteLandingPage, getStats,
};