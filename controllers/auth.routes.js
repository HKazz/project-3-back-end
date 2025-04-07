const User = require("../models/User")

const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const verifyToken = require("../middleware/verify-token")

router.post("/sign-up",async(req,res)=>{
    try{
        const foundUser = await User.findOne({username:req.body.username})
        
        if(foundUser){
            return res.status(409).json({err:"username already taken"})
        }
        const createdUser = await User.create({
            username:req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password,12)
        })
        console.log(createdUser)


        const convertedObject = createdUser.toObject()
        delete convertedObject.hashedPassword
        res.json(convertedObject)

    }
    catch(error){
        res.status(500).json(error)
    }

})

router.post("/login",async(req,res)=>{
    // destructure the req.body
    const {username,password} = req.body
    try{
        // 1. check if the user already signed up
        const foundUser = await User.findOne({username})

        // if there isnt a user this means that the user hasnt signed up yet
        if(!foundUser){
            return res.status(401).json({err:"username not signed up. Please sign up"})
        }
        console.log("In login")

        // 2. check if the password given in the req.body matches the passowrd in the DB
        const isPasswordMatch = bcrypt.compareSync(password,foundUser.hashedPassword)
        if(!isPasswordMatch){
            return res.status(401).json({err:"username or password incorrect"})
        }
        console.log("In login 2")

        // 3. create the JWT token
        const payload = foundUser.toObject()
        delete payload.hashedPassword
        console.log("In login 3")


        // sign(payload, secret password, expirastion time)
        const token = jwt.sign(payload,process.env.SESSION_SECRET,{expiresIn:"30m"})
        console.log("In login 4")


        res.status(200).json({token})

    }catch(error){
        res.status(500).json({error:error.message})
    }
})

router.get("/verify",verifyToken,(req,res)=>{
    console.log(req.user)
    res.json(req.user)
})




module.exports = router