import mongoose from "mongoose";

const shareTodoSchema = new mongoose.Schema(
  {
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
      required: true,
    },
    sharedWith: [ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

shareTodoSchema.index({ todoId: 1, sharedWith: 1 }, { unique: true });

const ShareTodo = mongoose.model("ShareTodo", shareTodoSchema);

export default ShareTodo;
