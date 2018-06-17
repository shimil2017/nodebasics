const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const bcrypt = require("bcrypt");

const { auth } = require("./middleware/auth");

const cookieParser = require("cookie-parser");

mongoose.connect("mongodb://localhost:27017/auth");
const { User } = require("./models/user");
app.use(bodyParser.json());

app.use(cookieParser());

app.post("/api/user", (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  user.save((err, doc) => {
    if (err) res.status(400).send(err);

    res.status(200).send(doc);
  });
});

app.post("/api/user/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) res.json({ message: "not authoraised" });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) {
        return res.status(400).json({
          message: "Wrong password"
        });
      } else {
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          console.log("here", user.token);
          res.cookie("auth", user.token).send("ok");
        });
      }
    });
  });
});

app.get("/user/profile", auth, (req, res) => {
  // console.log(token);
  res.status(200).send(req.token);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Started listen at ${port}`);
});
