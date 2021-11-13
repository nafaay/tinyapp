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
 * "short urls : "long urls"
 */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// app.get("/", (req, res) => {
//   res.send("Hello!");
// });


app.get("/urls", (req, res) =>{
  const templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
})


/**
 * GET route to show the form to create an URL
 */
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/**
 * Render information about a single URL
   shortURL is from the page, we can get it then from req.params
   longURL is the value for this particular shortURL from urlDatabase(key)
 */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});


/**
 * Listen on provided port
 */
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});