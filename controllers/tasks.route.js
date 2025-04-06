const router = require('express').Router() 
const Task = require('../models/Tasks')
const verifyToken = require('../middleware/verify-token')

router.get('/',verifyToken,async(req,res)=>{
    try {
        const allTasks = await Task.find()
        res.json(allTasks)
    } catch (error) {
        res.status(500).json({error:error})
    }
})  


router.get('/:taskId',verifyToken,async(req,res)=>{
    try {
        const foundTask = await Task.findById(req.params.taskId)
        res.json(foundTask)
    } catch (error) {
        res.json(error)
    }
})

router.post('/',verifyToken,async(req,res)=>{
    try {
        const newTask = await Task.create(req.body)
        newTask.save()
        res.status(201).json(newTask)
    } catch (error) {
        console.log('error')
        res.status(500).json({error:error.message})
    }
})

module.exports = router