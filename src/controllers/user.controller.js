import { User } from "../models/user.models.js"
import { cloudinaryUpload } from "../utils/cloudinary.js"

const generateAccessAndRefreshToken = async (id) => {
    const user = await User.findById(id)

    if (!user) return 'user not found';

    const accessToken =await user.generateAccessToken()
    const refreshToken =await user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({
        validateBeforeSave: false,
    });
    // console.log(accessToken, refreshToken, 'access tokensssssssssss')
    
    return { accessToken, refreshToken }
}


const registerUser =  async (req, res) => {
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
        const {fullName, username, email, password} = req.body
    
    
        if([fullName, username, email, password].some(s => !s)){
            return res.status(400).json({msg: 'All fields are required'})
        }
        // check if user already exists
    
        const user = await User.findOne({
            $or: [{username}, {email}]
        })
    
        // if(user){
        //     return res.status(400).json({msg: 'User already exists'})
        // }
    
        // console.log(req.files, '***********');
        let avatarUrl
        let coverImageUrl
    
        if(req.files?.avatar && req.files?.avatar.length){
            const avatarPath =  req.files?.avatar[0]?.path
            avatarUrl = await cloudinaryUpload(avatarPath)
        }else{
            return res.status(400).json({msg: 'Please upload an avatar'})
        }
        if(req.files?.coverImage && req.files?.coverImage.length){
            const coverImagePath =  req.files?.coverImage[0]?.path
            coverImageUrl = await cloudinaryUpload(coverImagePath)
        }
    
    
    
    
        const newUser =await User.create({
            fullName,
            username,
            email,
            password,
            avatar: avatarUrl.url,
            coverImage: coverImageUrl ? coverImageUrl.url : '',
        })
    
        const createdUser = await User.findById(newUser._id).select('-password -refreshToken')
    
        if(!createdUser)
            return res.status(500).json({msg: 'Failed to create user'})
    
    
        return res.status(201).json({
            data: createdUser,
            type: 'success', 
        }) 
    } catch (error) {
        res.status(500).json({msg: error.message})
    }

    
} 

const loginUser =async (req, res) => {
    const request = req.body
    const {email , username, password} = request
    if(!email && !username) {
        return res.status(400).json({msg: 'Please provide email or username'})
    }



    const user = await User.findOne({
        $or: [{email}]
    })
    console.warn(user);


    if(!user){
        return res.status(404).json({msg: 'Credentials not found'})
    }

    const matchPassword = await user.checkPassword(password)

    console.warn(matchPassword);

    if(!matchPassword){
        return res.status(400).json({msg: 'Invalid credentials'})
    }

    
    const loggedInUser = await User.findById(user._id).select('-password')

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    if(!accessToken){
        res.status(500).json({msg: 'something went wrong with access token'})
    }

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).
    cookie('access_token', accessToken,options).
    cookie('refresh_toekn', refreshToken,options).
    json({msg:'login successful',
        data: {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }
    })






    

}


export {
    registerUser,
    loginUser,
}