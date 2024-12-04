const express = require("express");
const { create, list, remove } = require("../controllers/category");
const { authCheck, adminCheck } = require("../middleware/authCheck");
const router = express.Router();

router.get("/category", list);
router.post("/category", authCheck, adminCheck, create);
router.delete("/category/:id", authCheck, adminCheck, remove);

module.exports = router;
