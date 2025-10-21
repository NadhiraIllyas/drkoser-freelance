const express = require('express');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all jobs (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, minBudget, maxBudget, search, skills } = req.query;
    let filter = { status: 'open' };

    if (category) filter.category = category;
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = parseInt(minBudget);
      if (maxBudget) filter.budget.$lte = parseInt(maxBudget);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (skills) {
      filter.skillsRequired = { $in: skills.split(',') };
    }

    const jobs = await Job.find(filter)
      .populate('client', 'name profile')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name profile');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
});

// Create new job (clients only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post jobs' });
    }

    const { title, description, category, budget, deadline, skillsRequired } = req.body;

    const job = new Job({
      title,
      description,
      category,
      budget,
      deadline,
      skillsRequired,
      client: req.user._id
    });

    await job.save();
    await job.populate('client', 'name profile');

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating job' });
  }
});

// Get jobs posted by current client
router.get('/client/my-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can access this' });
    }

    const jobs = await Job.find({ client: req.user._id })
      .populate('client', 'name profile')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

module.exports = router;