const express = require("express");
const authController = require("../controllers/auth");
const bodyParser = require("body-parser");
const { ensureAuthenticated } = require("../middleware/auth.js");

const jsonParser = bodyParser.json();

const router = express.Router();

router.post("/register", jsonParser, authController.registerUser);
router.post("/login", jsonParser, authController.loginUser);
router.get('/api/user', jsonParser, ensureAuthenticated, authController.getUser);
router.post("/logout", jsonParser, ensureAuthenticated, authController.logOutUser);
router.get("/api/search/users", jsonParser, ensureAuthenticated, authController.searchUser);

module.exports = router;