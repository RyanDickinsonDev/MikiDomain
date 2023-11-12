const express = require("express");
const siteController = require("../controllers/site");
const bodyParser = require("body-parser");
const { ensureAuthenticated } = require("../middleware/auth.js");

const jsonParser = bodyParser.json();

const router = express.Router();


router.post("/api/site/domain/search", jsonParser, ensureAuthenticated, siteController.domainListSearch);
router.post("/api/site/create", jsonParser, ensureAuthenticated, siteController.createSite);

module.exports = router;