const Project = require("../models/Project")
const router = require("express").Router()

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

router.put("/:projectId", async(req,res)=>{
    try {
        // const foundProject = await Project.findById(req.params.projectId)
        const updatedProject = await Project.findByIdAndUpdate(req.params.projectId,req.body,{new:true})
        
        res.json(updatedProject)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

router.delete("/:projectId", async(req,res)=>{
    try {
        const projectId = req.params.projectId
        const deletedProject = await Project.findByIdAndDelete(projectId)
        res.json(deletedProject)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

module.exports = router