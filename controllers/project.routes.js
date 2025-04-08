const Project = require("../models/Project")
const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")

router.get("/", async(req,res)=>{
    try {
        const allProjects = await Project.find().populate([
            "projectName",
            "projectDescription"
        ])
        res.json(allProjects)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.post("/", async(req,res)=>{
    try {
        const newProject = await Project.create(req.body)
        res.status(201).json(newProject)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})


router.get("/:projectId", async(req,res)=>{
    try {
        const foundProject = await Project.findById(req.params.projectId).populate([
            "projectName",
            "projectDescription"
        ])
        res.json(foundProject)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.put("/:projectId",verifyToken, async(req,res)=>{
    try {
        
        const foundProject = await Project.findById(req.params.projectId)
        if(!foundProject.projectManager.equals(req.user._id)){
            return res.status(409).json({err:"You are not the manager of this project."})
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.projectId,req.body,{new:true})
        
        res.json(updatedProject)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

router.delete("/:projectId",verifyToken, async(req,res)=>{
    try {
        const foundProject = await Project.findById(req.params.projectId)
        if(!foundProject.projectManager.equals(req.user._id)){
            return res.status(409).json({err:"You are not the manager of this project."})
        }
        const deletedProject = await Project.findByIdAndDelete(req.params.projectId)
        res.json(deletedProject)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.put("/:projectId/members",verifyToken, async (req,res)=>{
    try {
        const foundProject = await Project.findById(req.params.projectId)
        if(!foundProject.projectManager.equals(req.user._id)){
            return res.status(409).json({err:"You are not the manager of this project."})
        }
        if (!Array.isArray(req.body.teamMembers)) {
            return res.status(400).json({ err: "teamMembers must be an array." });
        }
        foundProject.teamMembers.push(...req.body.teamMembers);
        await foundProject.save();

        res.status(200).json(foundProject)
        
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.delete("/:projectId/:memberId", verifyToken, async (req,res)=>{
    try {
        const foundProject = await Project.findById(req.params.projectId)
        if(!foundProject.projectManager.equals(req.user._id)){
            return res.status(409).json({err:"You are not the manager of this project."})
        }
        foundProject.teamMembers.remove(req.params.memberId)
        foundProject.save()

        res.status(200).json(foundProject)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

module.exports = router