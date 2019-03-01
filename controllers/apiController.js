// Require all packages
const express = require("express");

// Require all models
const db = require("../models");

//Initialize the express router
const router = express.Router();

//Router to get articles
router.get("/articles", (req, res) => {
    let query = {};
    const queryIds = req.query.ids;
    if (queryIds && queryIds.length > 0) {
        query = {
            _id: queryIds.split(",")
        };
    }

    db.Article.find(query)
        .populate("notes")
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
    db.Article.deleteOne({ _id: req.params.id })
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
    db.Note.deleteOne({ _id: req.params.id })
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error deleting note from the database.");
        });
});

//Router to update a note
router.put("/notes/:id", (req, res) => {
    // Create a new note and pass the req.body to the entry
    const updatedNote = {
        text: req.body.text
    };

    db.Note.updateOne({ _id: req.params.id}, { $set: updatedNote })
        .then(result => {
            console.log(result);
            res.end();
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error updating note in the database.");
        });
});

module.exports = router;
