// ============================================================
// models/User.js — Defines the shape of a User in MongoDB
//
// LESSON: A Mongoose "Schema" is like a blueprint.
// It tells MongoDB what fields each document must/can have,
// what type they are, and any validation rules.
// ============================================================

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'], // [value, error message]
      trim: true                             // removes leading/trailing spaces
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,    // no two users can have same email
      lowercase: true, // always store as lowercase
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['admin', 'member'], // only these two values allowed
      default: 'member'          // new users are members by default
    }
  },
  {
    timestamps: true // auto-adds createdAt and updatedAt fields
  }
)

// ─── MIDDLEWARE (pre-save hook) ───────────────────────────
// This runs BEFORE saving a user to DB
// It hashes the password so we never store plain text
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// ─── INSTANCE METHOD ─────────────────────────────────────
// Add a custom method to every User document
// Usage: const isMatch = await user.comparePassword('plaintext')
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
