import { model, Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    // console.log('sdfsdf');
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.checkPassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: 60 * 60 }
    )
}
UserSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: 60 * 60 }
    )
}

export const User = model('User', UserSchema)
