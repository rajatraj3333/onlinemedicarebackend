const express = require("express");
const router = express.Router();
const otp = require("../../utils/uniquegen");
const authRouter = require("./auth");
const docRouter = require("./doctor");
const paymentRoute = require('./payment')
// Add your routes here
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRouter);

router.use("/doctor", docRouter);
router.use('/payment',paymentRoute)
router.get("/generateotp", async (req, res) => {
  let otpsend = await otp(6, 6);
  res.json({ otp: otpsend, status: 200 });
});

module.exports = router;
