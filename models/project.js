const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  created_on: {
    type: Date,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("projects", projectSchema);
