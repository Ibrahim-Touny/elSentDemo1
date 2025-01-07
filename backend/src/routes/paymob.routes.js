import {
  capture,
  createPaymentOrder,
  preAuthorize,
  refund,
  voidPreAuthorization,
  webHookController,
  webHookFinalController,
} from "../controllers/paymob.controller.js";
import { Router } from "express";
import { verifySeller, verifyUser } from "../middlewares/auth.middleware.js";
import {
  finalPayment,
  holdAmount,
  refundTransactions,
} from "../controllers/paymob.controller2.js";

const router = Router();

// POST route to create the payment order
// router.post("/", createPaymentOrder); /api/v1/paymob
// router.route("/").post(verifyUser, createPaymentOrder);
// router.route("/capture").post(capture);
// router.route("/preauthorize").post(preAuthorize);
// router.route("/void").post(voidPreAuthorization);
// router.route("/refund").post(refund);
router.route("/hold").post(holdAmount);
router.route("/final").post(verifyUser, finalPayment);
router.route("/refund").post(verifyUser, verifySeller, refundTransactions);

router.route("/webhook").post(webHookController);
router.route("/webhook-final").post(webHookFinalController);

export default router;
