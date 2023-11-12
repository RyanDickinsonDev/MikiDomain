const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;
const path = require("path");
const session = require("express-session");
const { sessionStore } = require("../database/db");

const sessionDuration = 30 * 60 * 1000; // 30 minutes in milliseconds


app.use(
  session({
    secret: process.env.YOUR_SECRET_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: sessionDuration,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("./client")); //renders all public facing pages

app.set("views", "views");

const authRoute = require("../routes/auth");
const dashBoardRoute = require("../routes/pages/dashboard");
const uploadRoute = require("../routes/upload");
const profileRoute = require("../routes/pages/profile");
const siteRoute = require("../routes/site");


app.use(dashBoardRoute);
app.use(authRoute);
app.use(profileRoute);
app.use(uploadRoute)
app.use(siteRoute);

app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "../", "views", "404.html"));
});

app.listen(PORT, err => {
  if (err) throw new Error(err.msg);
  console.log(
    `Server listening on PORT, ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
