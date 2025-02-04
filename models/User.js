const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["owner", "super_admin", "manager", "staff"],
    default: "staff",
  },
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpCreatedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  disabled : {type : Boolean, default : false}
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;