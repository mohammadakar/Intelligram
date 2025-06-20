const asyncHandler = require('express-async-handler');
const Report = require('../Models/Report');

module.exports.createReport = asyncHandler(async (req, res) => {
  const reporter = req.user._id;              
  const { referenceId, type, description } = req.body;
  if (!referenceId || !type) {
    return res.status(400).json({ message: 'reference and type are required' });
  }
  const report = await Report.create({ reporter, referenceId, type, description });
  res.status(201).json(report);
});


// Admin: list all
module.exports.listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'username profilePhoto');
  res.json(reports);
});
