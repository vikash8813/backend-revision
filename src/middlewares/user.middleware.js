import jwt from 'jsonwebtoken'
import { User } from '../models/user.models.js'

const getUser = async (req,res,next) => {
    const accessToken = req.cookies?.access_token || req.headers.Authorization

    if (!accessToken){
        return res.status(401).json({
            msg: "UnAuthorized"
        })
    }

    const userInfo = jwt.verify(accessToken,process.env.TOKEN_SECRET)

    if (!userInfo._id){
        res.status(500).json('could not decode token')
    }
    const user = await User.findById(userInfo._id).select('-password')

    if (!user){
        return res.status(401).json({
            msg: 'user not registered'
        })
    }

    req.user = user

    next()

}

export {
    getUser,
}