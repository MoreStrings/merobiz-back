import { Router } from "express";
import authRoute from "./auth.route.js"
import pricingRouter from './pricing.route.js'
import fetchProducts from "./fetch.route.js"
// import postRouter from "./post.route.js"
// import authentication from "../middewares/authentication.js"

const router = Router()

router.use("/auth", authRoute)

router.use("/api/pricing", pricingRouter)

router.use("/products", fetchProducts)
// router.use(authentication)

// router.use("/posts", postRouter)

export default router