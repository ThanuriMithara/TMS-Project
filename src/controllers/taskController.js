
import { prisma } from '../config/prisma.js';


// GET /api/tasks - Get all tasks
export const getTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const tasks = await prisma.task.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
      },
      include: { 
        assignments: { include: { user: true } }, 
        creator: true 
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// POST /api/tasks - Create a task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, assignee_ids } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        errorCode: 'VALIDATION_ERROR', 
        message: 'Title is required' 
      });
    }

    if (due_date && new Date(due_date) < new Date()) {
      return res.status(400).json({ 
        errorCode: 'VALIDATION_ERROR', 
        message: 'Due date cannot be in the past' 
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        due_date: due_date ? new Date(due_date) : null,
        created_by: req.user.userId,
        assignments: assignee_ids?.length
          ? { create: assignee_ids.map(uid => ({ user_id: uid })) }
          : undefined,
      },
      include: { assignments: { include: { user: true } } },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// GET /api/tasks/:id - Get single task
export const getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { 
        assignments: { include: { user: true } }, 
        comments: { include: { user: true } }, 
      },
    });

    if (!task) {
      return res.status(404).json({ 
        errorCode: 'NOT_FOUND', 
        message: 'Task not found' 
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// PUT /api/tasks/:id - Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { 
        title, 
        description, 
        priority, 
        due_date: due_date ? new Date(due_date) : undefined 
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// DELETE /api/tasks/:id - Delete task
export const deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// PATCH /api/tasks/:id/status - Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['todo', 'in_progress', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        errorCode: 'VALIDATION_ERROR', 
        message: 'Invalid status. Must be todo, in_progress, or completed' 
      });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// POST /api/tasks/:id/assign - Assign users to task
export const assignTask = async (req, res) => {
  try {
    const { user_ids } = req.body;

    if (!user_ids || user_ids.length === 0) {
      return res.status(400).json({ 
        errorCode: 'VALIDATION_ERROR', 
        message: 'user_ids are required' 
      });
    }

    await prisma.taskAssignment.createMany({
      data: user_ids.map(uid => ({ 
        task_id: req.params.id, 
        user_id: uid 
      })),
      skipDuplicates: true,
    });

    res.json({ message: 'Users assigned successfully' });
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// POST /api/tasks/:id/comments - Add comment
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        errorCode: 'VALIDATION_ERROR', 
        message: 'Comment content is required' 
      });
    }

    const comment = await prisma.comment.create({
      data: { 
        task_id: req.params.id, 
        user_id: req.user.userId, 
        content 
      },
      include: { user: true },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};

// GET /api/tasks/:id/comments - Get comments
export const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { task_id: req.params.id },
      include: { user: true },
      orderBy: { created_at: 'asc' },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ errorCode: 'SERVER_ERROR', message: error.message });
  }
};