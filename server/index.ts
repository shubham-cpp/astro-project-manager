import Express  from "express";
import { config as loadEnvConfig } from "dotenv";
import cors from 'cors'
import {connect} from 'mongoose'
import User from './src/models/User'

loadEnvConfig();

const PORT = process.env.PORT ?? 5001
const URI = process.env.DB_URI 

if(!URI){
    throw new Error('Error: env variable DB_URI is undefined')
}


const App = Express();
App.use(Express.json()) // Type of data sent, or server won't accept json
App.use(cors({origin:"http://localhost:3000"})) // 3000 only accept 

connect(URI).then(() => {
    App.get('/', (req, res) => {
        User.find().then((users) => {
            return res.json({
                success: true,
                data: users
            })
        })
    })


    App.listen(5000, () => {console.log("server started at 5000")})
}).catch((err) => {
    console.error('ERROR: While connecting to mongo \n ', err)
})

