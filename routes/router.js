import { Router } from "express";
import authRoute from "./auth.route.js"
// import postRouter from "./post.route.js"
// import authentication from "../middewares/authentication.js"

const router = Router()

router.use("/auth", authRoute)

// router.use(authentication)

// router.use("/posts", postRouter)

export default router