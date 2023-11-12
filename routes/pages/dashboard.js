const express = require("express");
const path = require("path");

const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth.js");

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../../", "views", "dashboard.html"));
});


module.exports = router;