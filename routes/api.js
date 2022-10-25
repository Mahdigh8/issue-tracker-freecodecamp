"use strict";

const Project = require("../models/project");
const Issue = require("../models/issue");

module.exports = function (app) {
  app.use((req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
  });

  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let projectName = req.params.project;
      const project = await Project.findOne({ name: projectName });
      if (project) return res.send([]);
      const allIssues = await Issue.find({ project_id: project._id });
      res.send(allIssues);
    })

    .post(async function (req, res) {
      let projectName = req.params.project;
      const { issue_title, issue_text, created_by } = req.body;
      const { assigned_to, status_text } = req.body;

      if (!(issue_title && issue_text && created_by)) {
        return res.send({ error: "required field(s) missing" });
      }

      let project = await Project.findOne({ name: projectName });
      if (!project) {
        project = await Project.create({ name: projectName });
      }

      const newIssue = await Issue.create({
        project_id: project._id,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
      });
      res.status(201).send(newIssue);
    })

    .put(async function (req, res) {
      let project = req.params.project;
    })

    .delete(async function (req, res) {
      let project = req.params.project;
    });
};
