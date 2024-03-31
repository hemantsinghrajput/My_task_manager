const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number, // Changed from 'integer' to 'Number'
    required: true,
  },
  dueDate: { // Changed from 'duedate' to 'dueDate', and 'integer' to 'Date'
    type: Date,
    required: true,
  }
}, {
  timestamps: true
});


const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
