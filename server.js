const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');
const authRoutes = require("./controllers/auth.routes");
const taskRoutes = require("./controllers/tasks.route");
const projectRoutes = require("./controllers/project.routes");
const Project = require("./models/Project");
const Task = require("./models/Tasks");
const verifyToken = require("./middleware/verify-token");
const User = require("./models/User");

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(logger('dev'));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API server is running' });
});

// Routes
app.use("/auth", authRoutes);
app.use('/project', projectRoutes);
app.use('/tasks', taskRoutes);

// Project routes
app.get('/api/projects', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('projectManager', 'username')
      .populate('teamMembers.user', 'username');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/user/projects', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ 
      $or: [
        { projectManager: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    })
    .populate('projectManager', 'username')
    .populate('teamMembers.user', 'username')
    .populate({
      path: 'tasks',
      populate: [
        { path: 'assignedUser', select: 'username' },
        { path: 'projectManager', select: 'username' }
      ]
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch user projects' });
  }
});

// Task routes
app.get('/api/tasks/:taskId', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedUser', 'username')
      .populate('projectManager', 'username');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.put('/api/tasks/:taskId', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is authorized to edit the task
    if (!task.projectManager.equals(req.user._id) && !task.assignedUser?.equals(req.user._id)) {
      return res.status(403).json({ error: 'You are not authorized to edit this task' });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { projectId, taskName, taskDescription, startDate, endDate, priority, status, assignedUser } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    
    if (!taskName || !taskDescription) {
      return res.status(400).json({ error: "Task name and description are required" });
    }
    
    const taskData = {
      taskName,
      taskDescription,
      startDate,
      endDate,
      priority,
      status,
      assignedUser,
      projectManager: req.user._id
    };
    
    const foundProject = await Project.findById(projectId);
    if (!foundProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const newTask = await Task.create(taskData);
    foundProject.tasks.push(newTask._id);
    await foundProject.save();
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// User routes
app.get('/api/users/username/:username', verifyToken, async (req, res) => {
  try {
    console.log('Searching for user with username:', req.params.username);
    const searchUsername = req.params.username.toLowerCase();
    console.log('Converted to lowercase:', searchUsername);
    
    const user = await User.findOne({ 
      username: searchUsername 
    }).select('-hashedPassword');
    
    console.log('Search result:', user);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Failed to find user' });
  }
});

app.get('/api/users/by-email/:email', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('_id email username');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error finding user by email:', error);
    res.status(500).json({ error: 'Failed to find user' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error", 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
