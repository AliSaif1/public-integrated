import Report from '../models/Reports.js';

export const getReport = async (req, res) => {
  const { userName } = req.params;

  try {
    // Find the report by either Name or fullName
    const report = await Report.findOne({
      $or: [
        { Name: userName },
        { fullName: userName }
      ]
    });

    // If no report is found, send a 404 response
    if (!report) {
      return res.status(404).json({ message: 'Report not found for this user' });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Server error while fetching report' });
  }
};
