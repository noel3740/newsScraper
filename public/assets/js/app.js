$(document).ready(function () {

    //Attach on click event to view notes button
    $(document).on("click", ".viewNotesButton", function() {
        $("#notesModal").modal("show");
    });

    function createArticleCards() {
        $(".articlesDiv").empty();

        //Get articles from the api
        $.ajax({
            type: "GET",
            url: "/api/articles",
            success: function (articles) {
                $(".articlesDiv").empty();

                //Loop thru all the articles obtained and create a card on the articlesDiv
                articles.forEach(function (article, index) {
                    var newCard = $(`
                    <div class="col-12">
                        <div class="card articleCard">
                            <div class="row">
                                <div class="col-lg-3 col-md-12 mt-4">
                                    <img src="${article.imageUrl}"
                                        alt="...">
                                </div>
                                <div class="col-lg-9 col-md-12">
                                    <div class="card-body">
                                        <h3><a href="${article.link}"
                                                target="_blank">${article.title}</a>
                                        </h3>
                                        <p class="card-text">${article.text}</p>
                                        <div class="articleButtonDiv">
                                            <button data-article-id="${article._id}" class="btn btn-primary float-right viewNotesButton">View Notes</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${(index + 1) < articles.length ? "<hr class=\"w-100\">" : ""}`);

                    $(".articlesDiv").append(newCard);
                });
            }
        });
    }

    //Populate the database with the latest articles
    $.ajax({
        type: "GET",
        url: "/api/scrape",
        success: function (response) {
            console.log(response);
            createArticleCards();
        }
    });


});