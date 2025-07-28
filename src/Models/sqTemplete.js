import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: false },
    marks: { type: Number, default: 1 },
    image: { type: String, required: false },
  },
  { _id: true }
);

const shortQuestionSchema = new mongoose.Schema(
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
    sqGroup: {
    /*  id: { type: String, required: true },
       parentIdx: { type: Number, required: true },*/
      questions: [questionSchema],
      isComplete: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const ShortQuestion =
  mongoose.models.ShortQuestion || mongoose.model("ShortQuestion", shortQuestionSchema);

export default ShortQuestion;
