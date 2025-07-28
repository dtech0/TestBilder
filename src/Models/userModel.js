import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  mobileNo: String,
  email: { type: String, required: true, unique: true },
  password: String,
   institutionName: String,
   version:{
    type: String,
    enum: ['english', 'bangla'],
   }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
