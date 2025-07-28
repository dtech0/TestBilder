
import mongoose from "mongoose";

const subQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: false },
   banglaNum: String,
  englishNum: String,
  image: String ,
  marks: { type: Number, default: 1 },
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: false },
  marks: { type: Number, default: 10 },
  passageImage: String, 
  subQuestions: [subQuestionSchema],
});

const cqSchema = new mongoose.Schema({
  cqType: {
    type: String,
    enum: ["cq-1", "cq-2"],
    default: "cq-1",
    required: false,
  },
  containedQuestion: { type: Number, required: false },
  parentIdx: { type: Number, required: false },
  id: { type: String, required: false }, 
  questions: [questionSchema],
  isComplete: { type: Boolean, default: false },
});



const fullCQTemplateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    primaryInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrimaryQuestionInfo",
      required: true,
    },

    cqs: {
      type: [cqSchema],
    },

    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FullCQTemplate =
  mongoose.models.FullCQTemplate ||
  mongoose.model("FullCQTemplate", fullCQTemplateSchema);

export default FullCQTemplate;
