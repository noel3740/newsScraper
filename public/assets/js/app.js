$(document).ready(function () {
    var alertDiv = $("#errorAlert");
    alertDiv.hide();

    //Attach on click event to view notes button
    $(document).on("click", ".viewNotesButton", function () {
        //Grab all the notes assocated with this article
        var articleId = $(this).data("article-id");

        $.ajax({
            type: "GET",
            url: `/api/articles/${articleId}`,
            success: function (article) {
                var notesModal = $("#notesModal");
                var notesContainer = notesModal.find(".modal-body");
                notesContainer.empty();

                console.log(article);

                article.notes.forEach(function (note) {
                    var noteDiv = $("<div>")
                        .addClass(`col-12 py-4 mb-1 border rounded`)
                        .text(note.text);

                    notesContainer.append(noteDiv);
                });

                //Show the notes modal
                notesModal.modal("show");
            },
            error: function (error) {
                console.log(error);
                alertDiv
                    .text("An error occured getting notes from the database!")
                    .slideDown();

                setTimeout(() => {
                    alertDiv.slideUp("slow");
                }, 2000);

            }
        });
    });

    // function createArticleCards() {
    //     $(".articlesDiv").empty();

    //     //Get articles from the api
    //     $.ajax({
    //         type: "GET",
    //         url: "/api/articles",
    //         success: function (articles) {
    //             $(".articlesDiv").empty();

    //             //Loop thru all the articles obtained and create a card on the articlesDiv
    //             articles.forEach(function (article, index) {
    //                 var newCard = $(`
    //                 <div class="col-12">
    //                     <div class="card articleCard">
    //                         <div class="row">
    //                             <div class="col-lg-3 col-md-12 mt-4">
    //                                 <img src="${article.imageUrl}"
    //                                     alt="...">
    //                             </div>
    //                             <div class="col-lg-9 col-md-12">
    //                                 <div class="card-body">
    //                                     <h3><a href="${article.link}"
    //                                             target="_blank">${article.title}</a>
    //                                     </h3>
    //                                     <p class="card-text">${article.text}</p>
    //                                     <div class="articleButtonDiv">
    //                                         <button data-article-id="${article._id}" class="btn btn-primary float-right viewNotesButton">View Notes</button>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 ${(index + 1) < articles.length ? "<hr class=\"w-100\">" : ""}`);

    //                 $(".articlesDiv").append(newCard);
    //             });
    //         }
    //     });
    // }

    // //Populate the database with the latest articles then create the article cards
    // $.ajax({
    //     type: "GET",
    //     url: "/api/scrape",
    //     success: function (response) {
    //         console.log(response);
    //         createArticleCards();
    //     }
    // });


});