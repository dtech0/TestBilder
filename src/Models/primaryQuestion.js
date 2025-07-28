import mongoose from 'mongoose';

const PrimaryQuestionInfoSchema = new mongoose.Schema({
      user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,  
  },

  version: {
    type: String,
    enum: ['english', 'bangla'],
    required: true,
  },
  institutionName: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  totalMark: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
  },
  examName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  paper: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th', '5th', 'none'],
    
  },
  subjectCode: {
    type: Number,
    required: false,
    min: 1,
    max: 999,

  },
  examType: {
    type: String,
    enum: ['mcq', 'cq', 'sq', 'cq_and_sq'],
    required: true,
  },
  totalTime: {
    type: String,
    required: true,
  },
  totalSet: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  examDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.PrimaryQuestionInfo || mongoose.model('PrimaryQuestionInfo', PrimaryQuestionInfoSchema);
