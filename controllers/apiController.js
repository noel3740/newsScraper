const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("../models");

//Router to get all articles
router.get("/articles", (req, res) => {
    db.Article.find()
        .then(dbArticles => {
            res.json(dbArticles);
        })
        .catch(error => {
            console.log(error);
            res.status(404).send("Error finding articles from the database.");
        });
});

//Router to get a specific article by it's id
router.get("/articles/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id })
        //Populate all notes associated with this particular article
        .populate("notes")
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(error => {
            console.log(error);
            res.status(404).send("Error finding article from the database.");
        });
});

//Router to create a note for an article
router.post("/articles/:id/notes", (req, res) => {
    // Create a new note and pass the req.body to the entry
    const newNote = {
        text: req.body.text
    };

    db.Note.create(newNote)
        .then(dbNote => {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true })
                .then(dbArticle => {
                    res.json(dbArticle);
                })
                .catch(error => {
                    console.log(error);
                    res.status(404).send("Error finding article assocated with inserted note.");
                });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error inserting note in the database.");
        });
});

//Router to delete an article
router.delete("/articles/:id", (req, res) => {
    db.Article.deleteOne({_id: req.params.id})
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error deleting article from the database.");
        });
});

//Router to delete a note.
router.delete("/notes/:id", (req, res) => {
    db.Note.deleteOne({_id: req.params.id})
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error deleting note from the database.");
        });
});

//Router to scrape articles and save them to the database. 
router.get("/scrape", (req, res) => {

    //Get website data using axios
    const websiteToScrape = "https://www.chicagotribune.com/news/";
    axios.get(websiteToScrape).then(axiosResponse => {
        //Parse data returned from axios using cherrio
        var $ = cheerio.load(axiosResponse.data);
        var articles = [];

        $(".trb_outfit_group_list_item").each((i, element) => {
            var article = {};

            article.title = $(element).children("section").children("h3").children("a").text();
            article.link = `https://www.chicagotribune.com${$(element).children("section").children("h3").children("a").attr("href")}`;
            article.imageUrl = $(element).children("a").children("img").attr("data-baseurl");
            article.text = $(element).children("section").children(".trb_outfit_group_list_item_brief").text();
            articles.push(article);
        });

        db.Article.insertMany(articles)
            .then(() => {
                res.send("Scrape Complete");
            })
            .catch(error => {
                console.log(error);
                res.status(500).send("Unable to insert articles to database.");
            });
    });
});



module.exports = router;
