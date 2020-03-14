const { db } = require('../admin.js');

exports.getAllGrievances = async (req, res, next) => {
  try {
    let grievances = [];
    const data = await db
      .collection('grievances')
      .orderBy('createdAt', 'desc')
      .get();
    data.forEach(doc => {
      grievances.push({
        grievanceId: doc.id,
        body: doc.data().body,
        userName: doc.data().userName,
        createdAt: doc.data().createdAt
      });
    });
    res.json(grievances);
  } catch (error) {
    next(error);
  }
};

exports.createGrievance = async (req, res, next) => {
  try {
    if (req.method !== 'POST') {
      return res.status(400).json({ error: 'Error Method not allowed' });
    }
    const newGrievance = {
      body: req.body.body,
      userName: req.user.userName,
      createdAt: new Date().toISOString()
    };
    const doc = await db.collection('grievances').add(newGrievance);
    res.json({
      message: `document ${doc.id} has been created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong airing a grievance' });
    next(error);
  }
};
