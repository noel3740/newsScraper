// Require all packages
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("../models");

//Initialize the express router
const router = express.Router();

//Function that will return a successful promise when all the articles have been inserted into the database
const insertAllArticlesPromise = articles => {

    return new Promise((resolve, reject) => {
        if (articles.length === 0) {
            resolve();
        }

        articles.forEach((article, index) => {

            db.Article.findOneAndUpdate(
                { title: article.title },
                article,
                { upsert: true, setDefaultsOnInsert: true })
                .then(() => {
                    if (index === (articles.length - 1)) {
                        resolve();
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    });

};

router.get("/", (req, res) => {
    //Get website data using axios
    const websiteToScrape = "https://www.chicagotribune.com/news/";
    axios.get(websiteToScrape).then(axiosResponse => {
        //Parse data returned from axios using cherrio
        const $ = cheerio.load(axiosResponse.data);

        const articles = [];

        $(".trb_outfit_group_list_item").each((i, element) => {
            const article = {};

            article.title = $(element).children("section").children("h3").children("a").text();
            article.link = `https://www.chicagotribune.com${$(element).children("section").children("h3").children("a").attr("href")}`;
            article.imageUrl = $(element).children("a").children("img").attr("data-baseurl");
            article.text = $(element).children("section").children(".trb_outfit_group_list_item_brief").text();

            articles.push(article);
        });

        //Insert all the articles in the database and insert if duplicate does not exist
        insertAllArticlesPromise(articles)
            .then(() => {
                res.render("index");
            })
            .catch(error => {
                console.log(error);
                return res.status(500).send("Unable to insert article to database.");
            });

    });
});

module.exports = router;