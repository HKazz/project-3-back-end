const Project = require("../models/Project")
const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")

router.get("/", async(req,res)=>{
    try {
        const allProjects = await Project.find().populate('projectManager', 'username')
        res.json(allProjects)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

router.post("/", verifyToken, async(req,res)=>{
    try {
        req.body.projectManager = req.user._id
        const newProject = await Project.create(req.body)
        res.status(201).json(newProject)
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
})


router.get("/:projectId", async(req,res)=>{
    try {
        const foundProject = await Project.findById(req.params.projectId)
            .populate('projectManager', 'username')
            .populate('teamMembers', 'username')
            .populate('tasks')
        
        if (!foundProject) {
            return res.status(404).json({error: "Project not found"})
        }
        
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

router.put("/:projectId/members", verifyToken, async (req, res) => {
    try {
        const foundProject = await Project.findById(req.params.projectId);
        if (!foundProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        if (!foundProject.projectManager.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not the manager of this project." });
        }

        if (!Array.isArray(req.body.teamMembers)) {
            return res.status(400).json({ error: "teamMembers must be an array." });
        }

        // Check if any of the new members are already in the project
        const alreadyAssigned = req.body.teamMembers.some(newMember => 
            foundProject.teamMembers.some(existingMember => 
                existingMember.user.toString() === newMember.user.toString()
            )
        );

        if (alreadyAssigned) {
            return res.status(409).json({ error: "One or more users are already members of this project." });
        }

        // Add the new members with their additional information
        foundProject.teamMembers.push(...req.body.teamMembers);
        await foundProject.save();

        // Populate the user information before sending the response
        const updatedProject = await Project.findById(req.params.projectId)
            .populate('projectManager', 'username')
            .populate('teamMembers.user', 'username');

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error adding team members:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:projectId/members', verifyToken, async (req, res) => {
    try {
        const foundProject = await Project.findById(req.params.projectId).populate('teamMembers');
        if (!foundProject) {
            return res.status(404).json({ err: "Project not found." });
        }
        if (!foundProject.projectManager.equals(req.user._id)) {
            return res.status(409).json({ err: "You are not the manager of this project." });
        }
        
        const teamMembers = foundProject.teamMembers
        res.json(teamMembers);
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
});

router.delete("/:projectId/:memberId", verifyToken, async (req, res) => {
    try {
        const foundProject = await Project.findById(req.params.projectId);
        if (!foundProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        if (!foundProject.projectManager.equals(req.user._id)) {
            return res.status(403).json({ error: "You are not the manager of this project." });
        }

        // Find the member by their user ID and remove them
        const memberIndex = foundProject.teamMembers.findIndex(
            member => member.user.toString() === req.params.memberId
        );

        if (memberIndex === -1) {
            return res.status(404).json({ error: "Member not found in this project" });
        }

        // Remove the member
        foundProject.teamMembers.splice(memberIndex, 1);
        await foundProject.save();

        // Populate the user information before sending the response
        const updatedProject = await Project.findById(req.params.projectId)
            .populate('projectManager', 'username')
            .populate('teamMembers.user', 'username');

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router