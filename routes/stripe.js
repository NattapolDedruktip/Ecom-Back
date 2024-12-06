const express = require("express");
const { authCheck } = require("../middleware/authCheck");
const { payment } = require("../controllers/stripe");
const router = express.Router();

router.post("/user/create-payment-intent", authCheck, payment);

module.exports = router;
