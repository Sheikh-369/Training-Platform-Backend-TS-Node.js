import {Sequelize} from "sequelize-typescript"
import { config } from "dotenv"
config()

const sequelize=new Sequelize({
    database:process.env.DB_NAME,
    host:process.env.DB_HOST,
    username:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    dialect:"mysql",
    port:Number(process.env.DB_PORT),
    models:[__dirname + "/models"]
})

sequelize.authenticate()
.then(()=>{
    console.log("Authentication Successful!")
})
.catch((err)=>{
    console.log("Unexpected Error!",err)
})

sequelize.sync({alter:false}).then(()=>{
    console.log("Migration Successful!")
})

export default sequelize