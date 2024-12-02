const express = require("express");
const { create, list, remove } = require("../controllers/category");
const router = express.Router();

router.get("/category", list);
router.post("/category", create);
router.delete("/category/:id", remove);

module.exports = router;
