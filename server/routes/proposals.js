const express = require('express');
const Proposal = require('../models/Proposal');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit proposal (freelancers only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can submit proposals' });
    }

    const { jobId, coverLetter, bidAmount, estimatedTime } = req.body;

    // Validate required fields
    if (!jobId || !coverLetter || !bidAmount || !estimatedTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is no longer accepting proposals' });
    }

    // Check if user is trying to apply to their own job
    if (job.client.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot apply to your own job' });
    }

    // Check if already applied
    const existingProposal = await Proposal.findOne({
      job: jobId,
      freelancer: req.user._id
    });
    
    if (existingProposal) {
      return res.status(400).json({ message: 'You have already submitted a proposal for this job' });
    }

    const proposal = new Proposal({
      job: jobId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      estimatedTime
    });

    await proposal.save();
    
    // Populate freelancer details for response
    await proposal.populate('freelancer', 'name profile');

    res.status(201).json({
      message: 'Proposal submitted successfully',
      proposal
    });
  } catch (error) {
    console.error('Proposal submission error:', error);
    res.status(500).json({ message: 'Server error submitting proposal' });
  }
});

// Get proposals for a specific job (client only)
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if current user is the job owner
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view proposals for your own jobs.' });
    }

    const proposals = await Proposal.find({ job: req.params.jobId })
      .populate('freelancer', 'name profile')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Server error fetching proposals' });
  }
});

// Get proposals submitted by current freelancer
router.get('/my-proposals', auth, async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can access this endpoint' });
    }

    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('job')
      .populate('job.client', 'name')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error('Error fetching my proposals:', error);
    res.status(500).json({ message: 'Server error fetching proposals' });
  }
});

// Update proposal status (client only - accept/reject)
router.put('/:proposalId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const proposal = await Proposal.findById(req.params.proposalId)
      .populate('job');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if current user is the job owner
    if (proposal.job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update proposal status
    proposal.status = status;
    await proposal.save();

    // If accepting a proposal, update job status and reject other proposals
    if (status === 'accepted') {
      // Update job status
      proposal.job.status = 'in-progress';
      await proposal.job.save();

      // Reject all other proposals for this job
      await Proposal.updateMany(
        { 
          job: proposal.job._id, 
          _id: { $ne: proposal._id } 
        },
        { status: 'rejected' }
      );
    }

    await proposal.populate('freelancer', 'name profile');

    res.json({
      message: `Proposal ${status} successfully`,
      proposal
    });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ message: 'Server error updating proposal status' });
  }
});

// Get proposal statistics for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'freelancer') {
      stats = await Proposal.aggregate([
        { $match: { freelancer: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    } else if (req.user.role === 'client') {
      // Get stats for client's jobs
      const jobs = await Job.find({ client: req.user._id });
      const jobIds = jobs.map(job => job._id);
      
      stats = await Proposal.aggregate([
        { $match: { job: { $in: jobIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching proposal stats:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;