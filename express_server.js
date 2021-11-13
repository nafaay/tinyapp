const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Object simulating a database to work on
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/test/hello", (req, res) => {
  res.send("Hello! from /test/hello");
});


app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});