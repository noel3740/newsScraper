//Require dependencies
const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

//Get the server port
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

//Use url encode and json middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

//Set handlebars as the view engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Connect to mongo db
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";
mongoose.connect(MONGODB_URI);

//require express routes
const apiRoutes = require("./controllers/apiController");
app.use("/api", apiRoutes);
const htmlRoutes = require("./controllers/htmlController");
app.use("/", htmlRoutes);

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});