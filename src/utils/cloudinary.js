import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'

async function cloudinaryUpload(filePath) {
    try {
        cloudinary.config({
            cloud_name: 'dm0k1knqj',
            api_key: '792988362237925',
            api_secret: process.env.CLOUDINARY_SECRET, // Click 'View API Keys' above to copy your API secret
        })
        if (!filePath) return null
        // console.log(process.env.CLOUDINARY_SECRET)

        // Upload an image
        const uploadResult = await cloudinary.uploader
            .upload(filePath, {
                resource_type: 'auto',
            })
            .catch((error) => {
                console.log(error)
            })

        // console.log(uploadResult)
        if (uploadResult) {
            fs.unlinkSync(filePath)
            return uploadResult
        }
    } catch (error) {
        fs.unlinkSync(filePath)
        console.log(error)
    }
}

export { cloudinaryUpload }
