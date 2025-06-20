import express from "express"
import router from "./routes/router.js"
import cors from "cors"

const app = express()
const port =  5000

app.use(express.json())

app.use(cors())

app.use("/", router)

app.listen(port, (error) => {
    if(error){
        console.log("Error running the server.")
    }
    console.log("Server is listening at port: ", port)
})