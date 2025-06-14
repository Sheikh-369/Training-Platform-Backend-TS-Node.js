import app from "./src/app";
import { config } from "dotenv";
config()
import "./src/database/connection"

const startServer=()=>{
    const port=process.env.PORT
    app.listen(port,()=>{
        console.log(`Server running at ${port}`)
    })
}

startServer()