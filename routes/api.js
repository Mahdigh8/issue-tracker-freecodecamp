"use strict";

const Project = require("../models/project");
const Issue = require("../models/issue");
const { queryOrBodyParser } = require("../utils/parsers");

module.exports = function (app) {
  app.use((req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
    next();
  });

  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let projectName = req.params.project;
      let fields = [
        "issue_title",
        "issue_text",
        "created_by",
        "assigned_to",
        "status_text",
        "open",
        "created_on",
        "updated_on",
      ];
      let query = queryOrBodyParser(req.query, fields);
      try {
        const project = await Project.findOne({ name: projectName });
        if (!project) return res.send([]);
        query.project_id = String(project["_id"]);
        console.log(query);
        const allIssues = await Issue.find(query)
          .select({ __v: 0, project_id: 0 })
          .exec();
        res.send(allIssues);
      } catch (err) {
        return res.send(err);
      }
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

      let newIssue = await Issue.create({
        project_id: project._id,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
      });
      newIssue = newIssue.toObject();
      res.status(201).send(newIssue);
    })

    .put(async function (req, res) {
      let project = req.params.project;
    })

    .delete(async function (req, res) {
      let project = req.params.project;
    });
};
