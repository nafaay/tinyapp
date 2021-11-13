/**@author: Youssef Nafaa < nafaayoussef@gmail.com>
 * @project: tinyapp for bootcamp at lighthouse lab Canada
 * @date: November 2021

/**
 * Using express to communicate between client and server
 */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

/**
 * Set ejs as the view engine
 */
app.set("view engine", "ejs");
/**
 * Object simulating a database to work on.
 * "short url"s : "long urls"
 */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) =>{
  const templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
})
/**
 * Listen on provided port
 */
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});