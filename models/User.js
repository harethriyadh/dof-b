const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toHexString(),
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    administrative_position: {
      type: String,
      required: false,
      trim: true,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['employee', 'manager', 'admin'],
      default: 'employee',
      lowercase: true,
      trim: true,
      index: true,
    },
    leave_balances: [
      {
        leave_type_id: { type: String, required: true, trim: true },
        available_days: { type: Number, required: true, min: 0 },
        one_time_used: { type: Boolean, default: false },
      },
    ],
    // Track when password was last changed to allow JWT invalidation
    password_changed_at: {
      type: Date,
    },
    // Optional token version for token invalidation strategy
    tokenVersion: {
      type: Number,
      default: 0,
    },
    // Optional password history to prevent reuse (store recent hashes)
    password_history: [
      {
        hash: { type: String },
        changedAt: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
