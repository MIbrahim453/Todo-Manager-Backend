import Todo from "../models/todo.model.js";
import ShareTodo from "../models/todoShare.model.js";
import User from "../models/user.model.js";

const createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const todo = await Todo.create({
      userId,
      title,
      description,
      priority,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    console.log("Error occurred while creating todo:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Todo creation failed",
    });
  }
};

const editTodo = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    const userId = req.user._id;
    const todoId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, userId },
      {
        userId,
        title,
        description,
        priority,
        status,
        dueDate,
      },
      { new: true },
    );

    if (todo) {
      return res.status(200).json({
        success: true,
        message: "Todo edited successfully",
        data: todo,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Todo cannot be edited",
        data: todo,
      });
    }
  } catch (error) {
    console.log("Error occurred while editing todo:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Todo edit failed",
    });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const userId = req.user._id;
    const todoId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const todo = await Todo.findOneAndDelete({
      _id: todoId,
      userId,
    });

    if (todo) {
      return res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
        data: todo,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Todo cannot be deleted",
        data: todo,
      });
    }
  } catch (error) {
    console.log("Error occurred while deleting todo:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Todo deletion failed",
    });
  }
};

const shareTodo = async (req, res) => {
  try {
    const { userIds = [] } = req.body;
    const todoId = req.params.todoId;
    const ownerId = req.user._id;

    const todo = await Todo.findOne({ _id: todoId, userId: ownerId });
    if (!todo) {
      return res.status(400).json({
        success: false,
        message: "Todo not found",
      });
    }

    const shared = [];
    const alreadyShared = [];
    const notFound = [];

    for (const id of userIds) {
      const user = await User.findOne({ _id: id });
      if (!user) {
        notFound.push(id);
        continue;
      }

      const isShared = await ShareTodo.findOne({ todoId, sharedWith: id });
      if (isShared) {
        alreadyShared.push(id);
        continue;
      }
      const updatedShare = await ShareTodo.findOneAndUpdate(
        { todoId },
        { $addToSet: { sharedWith: id }, sharedBy: ownerId },
        { upsert: true, new: true },
      );

      shared.push(id);
    }

    return res.status(200).json({
      success: true,
      message: "Todo shared successfully",
      data: {
        shared,
        alreadyShared,
        notFound,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Todo sharing failed",
    });
  }
};

const getTodos = async (req, res) => {
  try {
    const userId = req.user._id;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const searchTerm = req.query.searchTerm || "";
    const status =
      (req.query.status && req.query.status.toLowerCase() !== "all"
        ? req.query.status.toLowerCase()
        : "") || "";
    const priority =
      (req.query.priority && req.query.priority.toLowerCase() !== "all"
        ? req.query.priority.toLowerCase()
        : "") || "";
    const sortDirection = req.query.order?.toLowerCase() === "asc" ? 1 : -1;

    const todos = await Todo.find({
      userId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ dueDate: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalTodos = await Todo.countDocuments({ userId });
    const completedTodos = await Todo.countDocuments({
      userId,
      status: "completed",
    });
    const pendingTodos = await Todo.countDocuments({
      userId,
      status: "pending",
    });
    const sharedTodos = await ShareTodo.countDocuments({ sharedWith: userId });

    return res.status(200).json({
      success: true,
      message: "Todos retrieved successfully",
      data: {
        todos: todos || [],
        totalTodos,
        completedTodos,
        pendingTodos,
        sharedTodos,
      },
    });
  } catch (error) {
    console.log("Error occurred while getting todo:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Getting todos failed",
    });
  }
};

const getAllTodos = async (req, res) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const searchTerm = req.query.searchTerm || "";
    const status = req.query.status || "";
    const priority = req.query.priority || "";
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const todos = await Todo.find({
      ...(status && { status }),
      ...(priority && { priority }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ dueDate: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalTodos = await Todo.countDocuments();
    const completedTodos = await Todo.countDocuments({ status: "completed" });
    const pendingTodos = await Todo.countDocuments({ status: "pending" });
    const sharedTodos = await ShareTodo.countDocuments();
    return res.status(200).json({
      success: true,
      message: "Todos retrieved successfully",
      data: {
        todos: todos || [],
        totalTodos,
        completedTodos,
        pendingTodos,
        sharedTodos,
      },
    });
  } catch (error) {
    console.log("Error occurred while getting todo:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Getting todos failed",
    });
  }
};

const getSharedTodos = async (req, res) => {
  try {
    const userId = req.user._id;

    const sharedTodos = await ShareTodo.find({ sharedWith: userId })
      .populate("todoId", "title description status priority dueDate")
      .populate("sharedBy", "name email profilePhoto");

    const totalSharedTodos = await ShareTodo.countDocuments({
      sharedWith: userId,
    });

    const pendingSharedTodos = (sharedTodos || []).filter(
      (item) => item.todoId?.status === "pending"
    ).length;

    const completedSharedTodos = (sharedTodos || []).filter(
      (item) => item.todoId?.status === "completed"
    ).length;

    return res.status(200).json({
      success: true,
      message: "Shared todos retrieved successfully",
      data: {
        sharedTodos: sharedTodos || [],
        totalSharedTodos,
        pendingSharedTodos,
        completedSharedTodos,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Getting shared todo failed",
    });
  }
};

const markCompleted = async (req, res) => {
  try {
    const todoId = req.params.todoId;
    const userId = req.user._id;
    const { status } = req.body || {};

    const todo = await Todo.findOne({ _id: todoId, userId });
    if (!todo) {
      return res.status(400).json({
        success: false,
        message: "No Todo Found",
      });
    }

    const nextStatus = status === "completed" ? "pending" : "completed";

    const markAsCompleted = await Todo.findByIdAndUpdate(
      todoId,
      { status: nextStatus },
      { new: true },
    );

    if (!markAsCompleted) {
      return res.status(400).json({
        success: false,
        message: "Unable to complete the task",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Task marked as ${nextStatus}`,
      data: markAsCompleted,
    });
  } catch (error) {
    console.log("Error occurred while marking todo completed:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Marking todo completion failed",
    });
  }
};

const markSharedCompleted = async (req, res) => {
  try {
    const todoId = req.params.todoId;
    const userId = req.user._id;
    const { status } = req.body || {};

    const sharedTodo = await ShareTodo.findOne({ todoId, sharedWith: userId });
    if (!sharedTodo) {
      return res.status(400).json({
        success: false,
        message: "Todo not found",
      });
    }

    const nextStatus = status === "completed" ? "pending" : "completed";

    const markAsCompleted = await Todo.findByIdAndUpdate(
      sharedTodo.todoId,
      {
        status: nextStatus,
      },
      { new: true },
    );
    if (!markAsCompleted) {
      return res.status(400).json({
        success: false,
        message: "Unable to complete the task",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Task marked as ${nextStatus}`,
      data: markAsCompleted,
    });
  } catch (error) {
    console.log("Error occurred while marking todo completed:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Marking todo completion failed",
    });
  }
};

export {
  createTodo,
  editTodo,
  deleteTodo,
  shareTodo,
  getTodos,
  getAllTodos,
  getSharedTodos,
  markCompleted,
  markSharedCompleted,
};
