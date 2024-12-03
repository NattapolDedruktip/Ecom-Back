const express = require("express");

const router = express.Router();

const {
  create,
  list,
  remove,
  listby,
  searchFilters,
  update,
  read,
  createImages,
  removeImages,
} = require("../controllers/product");
const { authCheck, adminCheck } = require("../middleware/authCheck");

router.post("/product", create);
router.get("/products/:count", list);
router.put("/product/:id", update);
router.get("/product/:id", read);
router.delete("/product/:id", remove);
router.post("/productby", listby);
router.post("/search/filters", searchFilters);

router.post("/images", authCheck, adminCheck, createImages);
router.post("/removeimages", authCheck, adminCheck, removeImages);

module.exports = router;
