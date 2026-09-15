import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
  createTodo,
  deleteTodo,
  editTodo,
  getAllTodos,
  getSharedTodos,
  getTodos,
  markCompleted,
  markSharedCompleted,
  shareTodo,
} from "../controllers/todo.controller.js"

const router = express.Router()

router.post("/create-todo", verifyJWT, createTodo)
router.put("/edit-todo/:id", verifyJWT, editTodo)
router.delete("/delete-todo/:id", verifyJWT, deleteTodo)
router.post("/share-todo/:todoId", verifyJWT, shareTodo)
router.get("/my-todos", verifyJWT, getTodos)
router.get("/all-todos", verifyJWT, getAllTodos)
router.get("/shared-todos", verifyJWT, getSharedTodos)
router.put("/mark-completed/:todoId", verifyJWT, markCompleted)
router.put("/mark-shared-completed/:todoId", verifyJWT, markSharedCompleted)

export default router
