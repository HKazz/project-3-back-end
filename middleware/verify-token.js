const jwt = require("jsonwebtoken")
// This route checks the token in the request and verifies it for me
function verifyToken(req,res,next){
    try{

        const token = req.headers.authorization.split(" ")[1]
        console.log(token)

            
        const decoded = jwt.verify(token,process.env.SESSION_SECRET)
        console.log(decoded)

        req.user = decoded.payload

        next()
    }catch(err){
        // if there is any error we will send back this error message
        res.status(401).json({err: "invalid Token"})
    }
}

module.exports = verifyToken