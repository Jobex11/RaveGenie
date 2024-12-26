const express = require("express");
const { getWealthClases, addWealthClasses, editWealthClasses, deleteWealthClasses } = require("../controllers/admin/wealthclassController");

const router = express.Router();

router.get("/", getWealthClases);
router.put("/:id", editWealthClasses);
router.post("/create", addWealthClasses);
router.delete("/delete/:id", deleteWealthClasses);


module.exports = router;
