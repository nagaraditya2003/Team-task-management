// ============================================================
// models/Project.js — Defines a Project document in MongoDB
//
// LESSON: "ref: 'User'" creates a relationship between
// collections. Like a foreign key in SQL.
// mongoose.populate() later fills in the actual user data.
// ============================================================

const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    // The admin/user who created this project
    // ObjectId is MongoDB's unique ID type
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // points to the User collection
      required: true
    },
    // Array of user IDs — all team members on this project
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Project', ProjectSchema)
