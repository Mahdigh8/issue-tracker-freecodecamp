const Project = require('../models/project');
const Issue = require('../models/issue');

async function cleanUpDatabase() {
  console.log('Cleaning up database ...');
  const project = await Project.findOne({ name: 'apitest' });
  if (!project) return;
  await Issue.deleteMany({ project_id: project._id });
  await Project.deleteOne({ name: 'apitest' });
}

module.exports = cleanUpDatabase;
