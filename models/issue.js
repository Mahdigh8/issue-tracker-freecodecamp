const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
  },
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: {
    type: String,
  },
  status_text: {
    type: String,
  },
  created_on: {
    type: Date,
    default: new Date().toISOString(),
  },
  updated_on: {
    type: Date,
    default: new Date().toISOString(),
  },
  open: {
    type: Boolean,
    default: true,
  },
}, {
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.project_id;
    }
  }
});

//middleware for mongoose that will create or update Date properties
issueSchema.pre("save", (next) => {
  this.updated_on = new Date().toISOString();
  next();
});

module.exports = mongoose.model("issues", issueSchema);
