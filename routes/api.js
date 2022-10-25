const Project = require('../models/project');
const Issue = require('../models/issue');
const { queryOrBodyParser } = require('../utils/parsers');

module.exports = function (app) {
  app.use((req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
    next();
  });

  app
    .route('/api/issues/:project')

    .get(async (req, res) => {
      const projectName = req.params.project;
      const fields = [
        'issue_title',
        'issue_text',
        'created_by',
        'assigned_to',
        'status_text',
        'open',
        'created_on',
        'updated_on',
      ];
      const query = queryOrBodyParser(req.query, fields);
      try {
        const project = await Project.findOne({ name: projectName });
        if (!project) return res.send([]);
        query.project_id = String(project._id);
        const allIssues = await Issue.find(query)
          .select({ __v: 0, project_id: 0 })
          .exec();
        res.send(allIssues);
      } catch (err) {
        return res.status(400).send(err);
      }
    })

    .post(async (req, res) => {
      const projectName = req.params.project;
      const { issue_title, issue_text, created_by } = req.body;
      const { assigned_to, status_text } = req.body;

      if (!(issue_title && issue_text && created_by)) {
        return res.status(400).send({ error: 'required field(s) missing' });
      }

      let project = await Project.findOne({ name: projectName });
      if (!project) {
        project = await Project.create({ name: projectName });
      }

      let newIssue = await Issue.create({
        project_id: project._id,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
      });
      newIssue = newIssue.toObject();
      res.status(201).send(newIssue);
    })

    .put(async (req, res) => {
      const projectName = req.params.project;
      const issueId = req.body._id;
      if (!issueId) return res.status(400).send({ error: 'missing _id' });

      const fields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
      const fieldsToUpdate = queryOrBodyParser(req.body, fields);
      if (req.body.open !== undefined) fieldsToUpdate.open = req.body.open;

      if (!Object.keys(fieldsToUpdate).length) {
        return res.status(400).send({ error: 'no update field(s) sent', issueId });
      }

      try {
        const project = await Project.findOne({ name: projectName });
        if (!project) throw Error('Project Not Found');
        const issue = await Issue.findById({ _id: issueId });
        Object.keys(fieldsToUpdate).forEach((field) => {
          issue[field] = fieldsToUpdate[field];
        });
        issue.updated_on = new Date().toISOString();
        await issue.save();
        res.send({ result: 'successfully updated', _id: issueId });
      } catch (err) {
        // console.log(err);
        res.status(400).send({ error: 'could not update', issueId });
      }
    })

    .delete(async (req, res) => {
      const projectName = req.params.project;
      const issueId = req.body._id;
      if (!issueId) return res.status(400).send({ error: 'missing _id' });

      try {
        const project = await Project.findOne({ name: projectName });
        if (!project) throw Error('Project Not Found');
        await Issue.findByIdAndRemove({ _id: issueId });
        res.send({ result: 'successfully deleted', _id: issueId });
      } catch (err) {
        // console.log(err);
        res.status(400).send({ error: 'could not delete', _id: issueId });
      }
    });
};
