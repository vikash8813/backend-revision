import { Router } from "express";
import { loginUser, logOutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js'
import { upload } from "../middlewares/multer.middleware.js";
import { getUser } from '../middlewares/user.middleware.js'


const router = Router()

router.route('/register').post(upload.fields([{
    name: 'avatar',
    maxCount: 1,
}
]),registerUser)

router.route('/login').post(loginUser)
router.route('/logout').post(getUser,logOutUser)
router.route('/refreshAccessToken').post(refreshAccessToken)

export default router;



