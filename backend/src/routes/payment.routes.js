import { Router } from "express";
import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
import { paymentCheckout} from "../controllers/payment.controller.js";

const router = Router();

router.route("/checkout").post(verifyUser, paymentCheckout)

export default router;
