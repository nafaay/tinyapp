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
 * bodyParser is a middleware that will help us 
 * to read data buffer when using POST requests
 */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


/**
 * Object simulating a database to work on.
 * '"short urls" : "long urls"'
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
 * Attention: This must be above any specific route (/urls/:id)
 * If not Express will think that /new is a specific route like
 * /:shortURL
 */
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/**
 * Render information about a single URL
   shortURL is from the page, we can get itfrom req.params
   longURL is the value for this shortURL from urlDatabase(key)
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