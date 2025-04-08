const router = require('express').Router() 
const Task = require('../models/Tasks')
const Project = require('../models/Project')
const verifyToken = require('../middleware/verify-token')

router.get('/:projectId/tasks',verifyToken,async(req,res)=>{
    try {
        const project = await Project.findById(req.params.projectId).populate('tasks')
        res.json(project.tasks)
    } catch (error) {
        res.status(500).json({error:error})
    }
})  


router.get('/:projectId/tasks/:taskId',verifyToken,async(req,res)=>{
    try {
        const foundTask = await Task.findById(req.params.taskId)
        res.json(foundTask)
    } catch (error) {
        res.json(error)
    }
})

router.post('/:projectId/tasks',verifyToken,async(req,res)=>{
    try {
        const foundProject = await Project.findById(req.params.projectId)
        const newTask = await Task.create(req.body)
        foundProject.tasks.push(newTask._id)
        foundProject.save()
        res.status(201).json(newTask)
    } catch (error) {
        console.log('error')
        res.status(500).json({error:error.message})
    }
})

router.delete('/:projectId/tasks/:taskId',verifyToken,async(req,res)=>{
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.taskId)

        res.json(deletedTask)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.put('/:projectId/tasks/:taskId',verifyToken,async(req,res)=>{
    console.log("FOUNDid",req.user)

    try {
        const foundProject = await Project.findById(req.params.projectId)
        if (!foundProject) {
            return res.status(404).json({ err: "Project not found." });
        }
        console.log(!(foundProject.projectManager.equals(req.user._id)))
        console.log("Manager: ", foundProject.projectManager)

        if(foundProject.projectManager.equals(req.user._id) == false && foundProject.teamMembers.includes(req.user._id) == false){
            return res.status(409).json({err:"You are not allowed on this project."})
        }
        else{
            console.log("project checks out")
        }
        const foundTask = await Task.findById(req.params.taskId)
        if(!foundTask.projectManager.equals(req.user._id) && !foundTask.assignedUser.equals(req.user._id)){
            return res.status(409).json({err:"You are not authorized to edit this task."})
        }
        else{
            console.log("task checks out")
        }
        const upadtedTask = await Task.findByIdAndUpdate(req.params.taskId,req.body,{new:true})

        res.json(upadtedTask)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.put('/:projectId/tasks/:taskId/member', verifyToken, async(req,res)=>{
    try {
        const foundProject = await Project.findById(req.params.projectId)
        if(!foundProject.projectManager.equals(req.user._id)){
            return res.status(409).json({err:"You are not allowed on this project."})
        }
        const foundTask = await Task.findById(req.params.taskId)
        if(!foundTask.projectManager.equals(req.user._id)){
            return res.status(409).json({err:"You are not authorized to edit this task."})
        }

        foundTask.assignedUser = req.body.assignedUser;
        await foundTask.save();
        res.status(201).json(foundTask)

    } catch (error) {
        res.status(500).json({err:error.message})
    }
})

router.get('/:projectId/assignedUsers', verifyToken, async (req, res) => {
    try {
        const foundProject = await Project.findById(req.params.projectId).populate({
            path: 'tasks',
            populate: { path: 'assignedUser' }
        });
        if (!foundProject) {
            return res.status(404).json({ err: "Project not found." });
        }

        const assignedUsers = foundProject.tasks
            .filter(task => task.assignedUser)
            .map(task => task.assignedUser);

        res.json(assignedUsers);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
})

router.delete("/:projectId/tasks/:taskId/:assignedUserId", verifyToken, async (req,res)=>{
    try {
        const foundTask = await Task.findById(req.params.taskId)
        if(!foundTask){
            return res.status(509).json({err: "No task found."})
        }
        if(!foundTask.projectManager.equals(req.user._id)){
            return res.status(409).json({err:"You are not the manager of this project."})
        }
        const assignedUserId = req.params.assignedUserId
        console.log("Assigned User: " + assignedUserId)
        foundTask.assignedUser = null
        foundTask.save()

        res.status(200).json(foundTask)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

module.exports = router