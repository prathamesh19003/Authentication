const express = require("express");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const session = require("express-session");

app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1:27017/login")
  .then(() => {
    console.log("sucessfully connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(session({ secret: "thisisasecret" }));
app.set("view engine", "ejs");
app.set("views", "views");
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/", (req, res) => {
  res.send("HOME");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const newUser = new User({
    username,
    password: hash,
  });
  await newUser.save();
  req.session.user_id = newUser._id;
  console.log("user saved sucessfully");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    req.session.user_id = user._id;
    res.redirect("/secret");
  } else {
    res.send("TRY AGAIN");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("secret");
});

app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000");
});
