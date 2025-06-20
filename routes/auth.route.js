import {Router} from "express";
import { login, register} from "../services/auth.service.js";

const router = Router()

router.post("/login",async (req,res)=>{
    try{
        const result = await login(req)
        res.send(result)
    }catch(error){
        console.log("Error at login: ", error)
        res.status(400).send({
            message:"Error Occured",
            error:error
        })
    }
})

router.post("/register",async (req,res)=>{
    try{
        const result = await register(req)
        res.send(result)
    }catch(error){
        console.log("error: ", error)
        res.status(400).send({
            message:"Error Occured",
            error:error
        })
    }
})

router.post("/forgetPassword",(req,res)=>{
    res.end("Feature comming soon :)");
})

export default router;