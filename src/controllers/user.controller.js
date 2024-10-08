import { User } from '../models/user.models.js'
import { cloudinaryUpload } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (id) => {
    const user = await User.findById(id)

    if (!user) return 'user not found'

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({
        validateBeforeSave: false,
    })

    return { accessToken, refreshToken }
}

const registerUser = async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // console.log(req.body)
    try {
        const { fullName, username, email, password } = req.body

        if ([fullName, username, email, password].some((s) => !s)) {
            return res.status(400).json({ msg: 'All fields are required' })
        }
        // check if user already exists

        const user = await User.findOne({
            $or: [{ username }, { email }],
        })

        // if(user){
        //     return res.status(400).json({msg: 'User already exists'})
        // }

        // console.log(req.files, '***********');
        let avatarUrl
        let coverImageUrl

        if (req.files?.avatar && req.files?.avatar.length) {
            const avatarPath = req.files?.avatar[0]?.path
            avatarUrl = await cloudinaryUpload(avatarPath)
        } else {
            return res.status(400).json({ msg: 'Please upload an avatar' })
        }
        if (req.files?.coverImage && req.files?.coverImage.length) {
            const coverImagePath = req.files?.coverImage[0]?.path
            coverImageUrl = await cloudinaryUpload(coverImagePath)
        }

        const newUser = await User.create({
            fullName,
            username,
            email,
            password,
            avatar: avatarUrl.url,
            coverImage: coverImageUrl ? coverImageUrl.url : '',
        })

        const createdUser = await User.findById(newUser._id).select(
            '-password -refreshToken'
        )

        if (!createdUser)
            return res.status(500).json({ msg: 'Failed to create user' })

        return res.status(201).json({
            data: createdUser,
            type: 'success',
        })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const loginUser = async (req, res) => {
    const request = req.body
    const { email, username, password } = request
    if (!email && !username) {
        return res.status(400).json({ msg: 'Please provide email or username' })
    }

    const user = await User.findOne({
        $or: [{ email }],
    })
    console.warn(user)

    if (!user) {
        return res.status(404).json({ msg: 'Credentials not found' })
    }

    const matchPassword = await user.checkPassword(password)

    console.warn(matchPassword)

    if (!matchPassword) {
        return res.status(400).json({ msg: 'Invalid credentials' })
    }

    const loggedInUser = await User.findById(user._id).select('-password')

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    )

    if (!accessToken) {
        res.status(500).json({ msg: 'something went wrong with access token' })
    }

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie('access_token', accessToken, options)
        .cookie('refresh_toekn', refreshToken, options)
        .json({
            msg: 'login successful',
            data: {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
        })
}

const logOutUser = async (req, res) => {
    const user = req.user

    await User.findByIdAndUpdate(user._id, {
        $set: { refreshToken: null },
    },
        {
            new: true,
        }
        )

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie('access_token',options).clearCookie('refresh_token',options).json({
        msg: 'logout successfully'
    })
}

const refreshAccessToken = async (req,res) =>{
    try{
        const incomingRefreshToken = req.cookies.refresh_token || req.headers.refresh_token

        if (!incomingRefreshToken){
            return res.status(401).json('unauthorized')
        }

        const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)


        const user = await User.findById(decodedToken._id)

        if (!user){
            return res.status(401).json({
                msg: 'unauthorized'
            })
        }
        const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).cookie('access_token',accessToken,options).cookie('refresh_token',refreshToken,options).json({
            msg: 'token updated'
        })



    }catch (e) {
        return res.status(500).json({
            msg: 'error'
        })
    }
}


const changeUserPassword = async (req,res) => {
    const {oldPassword,newPassword} = req.body

    if (!newPassword){
        return res.status(400).json(
            {
                msg: 'new password not provided'
            }
        )
    }

    const user = User.findById(req.user._id)


    const isPasswordCorrect = user.checkPassword(oldPassword)

    if (!isPasswordCorrect){
        return res.status(400).json(
            {
                msg: 'old password does not matches',
            }
        )
    }

    user.password = newPassword
    await user.save({
        validateBeforeSave: false,
    })
    // await User.findByIdAndUpdate(user._id,{
    //     $set:{
    //         password: newPassword,
    //     }
    // },
    //     {
    //         new: true
    //     }
    //     )

    return res.status(200).json({
        msg: 'password updated successfully',
    })
}

const updateAccountDetails = async (req,res) => {
    const {email, fullName} = req.body

    if (!email || !fullName){
        return res.status(400).json({
            msg: 'fullName or email not provided'
        })
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set:{
            email,
            fullName,
        }
    },
        {
            new: true
        }
    ).select('-password')

    return res.status(200).json({
        msg: 'updated successfully',
        data: user,
    })
}

const updateUserAvatar = async (req,res) => {
    const {avatar} = req.file?.path

    if (!avatar){
        return res.status(400).json({
            msg: 'avatar not provided'
        })
    }

    const uploadAvatar = await cloudinaryUpload(avatar)

    if (!uploadAvatar){
        return res.status(500).json({
            msg: 'error occurred on server when uploading the avatar'
        })
    }


    const user = await User.findByIdAndUpdate(req.user._id,{
        $set: {
            avatar: uploadAvatar.url,
        }
    }, {
        new: true,
        }
    )

    return res.status(200).json({
        msg: 'avatar updated successfully',
        data: user,
    })
}

const updateUserCoverImage = async (req,res) => {
    const {coverImage} = req.file?.path

    if (!coverImage){
        return res.status(400).json({
            msg: 'coverImage not provided'
        })
    }

    const uploadAvatar = await cloudinaryUpload(coverImage)

    if (!uploadAvatar){
        return res.status(500).json({
            msg: 'error occurred on server when uploading the coverImage'
        })
    }


    const user = await User.findByIdAndUpdate(req.user._id,{
        $set: {
            coverImage: uploadAvatar.url,
        }
    }, {
        new: true,
        }
    )

    return res.status(200).json({
        msg: 'coverImage updated successfully',
        data: user,
    })
}


const getChannelProfile = async (req,res) =>{
    const {username} = req.params

    if (!username){
        return res.status(500).json({
            msg: 'Username not provided'
        })
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username.toLowerCase()
            }
        },
        {
            $lookup:{
                from: 'subscriptions',
                foreignField: 'channel',
                localField: '_id',
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                foreignField: 'subscriber',
                localField: '_id',
                as: 'subscribeTo',
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: '$subscribers',
                },
                subscribedToCount:{
                    $size: '$subscribeTo',
                },
                isCurrentUserSubscribed: {
                    $cond:{
                        if: {
                            $in: [req.user._id,'$subscribers.subscriber']
                        },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }        }
    ])

    return res.status(200).json({
        data: channel
    })
}



export { registerUser, loginUser, logOutUser, refreshAccessToken,changeUserPassword,updateUserAvatar,updateUserCoverImage,updateAccountDetails, getChannelProfile }
