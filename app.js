import express, { urlencoded } from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import userRouter from './src/router/user.routes.js'

const app = express(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json({
    limit: '16kb',
}));

app.use(express.static('public'))

// app.use(urlencoded({
//     limit: '16kb',
// }))

app.use(express.urlencoded({ extended: true,limit: '16kb'  }))

app.use(cookieParser());

app.use('/api/users',userRouter)





export {app}