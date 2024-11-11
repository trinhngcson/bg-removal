import express from "express";
import {
  checkStatusOrder,
  clerkWebhooks,
  paymentCallBack,
  paymentZalopay,
  userCredits,
} from "../controllers/userController.js";
import authUser from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/webhooks", clerkWebhooks);
userRouter.get("/credits", authUser, userCredits);
userRouter.post("/payment", authUser, paymentZalopay);
userRouter.post("/callback", paymentCallBack);
userRouter.post("/check-status-order", checkStatusOrder);

export default userRouter;
