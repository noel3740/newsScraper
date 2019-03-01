$(document).ready(function () {
    var favoritesLocalStorageName = "newsScrapperFavs";

    //Compile the handlebar templates to be used later
    var notesTemplate = $("#notesTemplate")[0].innerHTML;
    var renderNotes = Handlebars.compile(notesTemplate);
    var articlesTemplate = $("#articlesHandleBarsTemplate")[0].innerHTML;
    var renderArticles = Handlebars.compile(articlesTemplate);

    //Initially hide the alert div
    var alertDiv = $("#errorAlert");
    alertDiv.hide();

    //Initially hide the favorites section
    $("#favoritesSection").hide();

    //Get top articles to display on screen
    function displayArticles() {
        var articlesContainer = $(".articlesDiv");
        articlesContainer.empty();

        $.ajax({
            type: "GET",
            url: `/api/articles?limit=20`,
            success: function (articles) {
                var articleCards = renderArticles({ articles: articles });
                articlesContainer.append(articleCards);
            },
            error: function (error) {
                console.log(error);
                displayMessage("An error occured getting articles from the database!", true);
            }
        });
    }

    displayArticles();

    //function that changes the favorite icon on a particular article
    function changeFavoriteIcon(articleId, makeFav) {
        var favoriteIcon = $(`.favoriteIcon[data-article-id="${articleId}"]`);

        if (favoriteIcon) {
            //Toggle between full heart icon and empty heart icon
            if (makeFav) {
                favoriteIcon.removeClass("far").addClass("fas");
            } else {
                favoriteIcon.removeClass("fas").addClass("far");
            }
        }
    }


    //Function that will refresh the favorite articles
    function refreshFavoriteArticles() {
        var currentFavorites = JSON.parse(localStorage.getItem(favoritesLocalStorageName));
        var favoriteContainer = $(".favoritesContainer");
        favoriteContainer.empty();

        if (currentFavorites && currentFavorites.length > 0) {
            $.ajax({
                type: "GET",
                url: `/api/articles?ids=${currentFavorites.join(",")}`,
                success: function (articles) {
                    favoriteContainer.append(renderArticles({ articles: articles, isFavorites: true }));
                }
            });
        }
    }

    //Find all current favorited articles and display them as such
    function checkFavorites() {
        var currentFavorites = JSON.parse(localStorage.getItem(favoritesLocalStorageName));
        var favoriteContainer = $(".favoritesContainer");
        favoriteContainer.empty();

        if (currentFavorites) {
            currentFavorites.forEach(function (articleId) {
                changeFavoriteIcon(articleId, true);
            });

            //Refresh the favorite articles in the html
            refreshFavoriteArticles();
        }
    }

    //Run the check favorites function to make the favorite icon full or not initially
    checkFavorites();

    //Function to display alert message to user
    function displayMessage(message, isError) {

        alertDiv.removeClass("alert-danger alert-success");

        var alertClass = isError ? "alert-danger" : "alert-success";
        alertDiv.addClass(alertClass);

        alertDiv
            .text(message)
            .slideDown();

        setTimeout(() => {
            alertDiv.slideUp("slow");
        }, 3000);
    }


    //Function that gets the notes for the current article and populates the notes modal
    function populateNotes(articleId) {
        //Enable the add button
        $("#addNoteButton").prop("disabled", false);

        var notesModal = $("#notesModal");

        $.ajax({
            type: "GET",
            url: `/api/articles/${articleId}`,
            success: function (article) {

                var notesContainer = notesModal.find(".modal-body");
                notesContainer.empty();

                if (article.notes) {
                    //Create a notes div from all the notes using the handlebars notes template
                    var noteDiv = $(renderNotes({ notes: article.notes, isNewNote: false }));
                    notesContainer.append(noteDiv);
                }

                //Show the notes modal
                notesModal.modal("show");
            },
            error: function (error) {
                console.log(error);
                displayMessage("An error occured getting notes from the database!", true);
            }
        });
    }

    //Attach on click event to view notes button
    $(document).on("click", ".viewNotesButton", function () {
        //Set the article-id data attribute on the modal
        var articleId = $(this).data("article-id");
        $("#notesModal").data("article-id", articleId);

        //Populate the screen with all the notes for the current article
        populateNotes(articleId);

        //Scroll to the bottom of the notes container so the newest note is displayed
        var notesContainer = $("#notesModal .modal-body");
        notesContainer.animate({ scrollTop: $(".notesBody").height() });
    });

    //On input event for note text area
    $(document).on("input", ".noteTextArea", function (event) {
        //Enable or disable the save button on the note
        var noteTextArea = $(event.target);
        var noteId = noteTextArea.data("note-id");
        var saveNoteButton = $(`.noteSaveBtn[data-note-id=${noteId}]`);
        var enableSaveButton = (event.target.value.trim() !== "");

        saveNoteButton.prop("disabled", !enableSaveButton);
    });

    //On click event for note save button
    $(document).on("click", ".noteSaveBtn", function () {
        var articleId = $("#notesModal").data("article-id");
        var noteId = $(this).data("note-id").toString();
        var httpMethod = noteId !== "-1" ? "PUT" : "POST";
        var apiUrl = noteId !== "-1" ? `/api/notes/${noteId}` : `/api/articles/${articleId}/notes`;

        const note = {
            text: $(`.noteTextArea[data-note-id="${noteId}"]`).val()
        };

        $.ajax({
            type: httpMethod,
            url: apiUrl,
            data: note,
            success: function () {
                displayMessage("Successful update/insert of note!");
                populateNotes(articleId);
            },
            error: function (error) {
                console.log(error);
                displayMessage("An error occured saving the note to the database!", true);
            }
        });

    });

    //On click method for the note delete button
    $(document).on("click", ".noteDeleteBtn", function () {

        //Send a delete request to the API to delete the note from the database
        var noteId = $(this).data("note-id");

        $.ajax({
            type: "DELETE",
            url: `/api/notes/${noteId}`,
            success: function () {
                displayMessage("Successful deletion of note!");

                //Slowly remove the note with animation
                $(`.noteContainer[data-note-id=${noteId}]`)
                    .hide("slow", function () { $(this).remove(); });

            },
            error: function (error) {
                console.log(error);
                displayMessage("An error occured deleting the note from the database!", true);
            }
        });
    });

    $("#addNoteButton").on("click", function () {
        //Disable the add button until they hit save on that new note
        $(this).prop("disabled", true);

        var notesModal = $("#notesModal");
        var notesContainer = notesModal.find(".modal-body");

        var newNote = {
            text: "",
            _id: "-1"
        };

        //Render the notes container div from the handlebars template
        var noteDiv = $(renderNotes({ notes: [newNote], isNewNote: true }));

        notesContainer.append(noteDiv);

        //Scroll to the bottom of the notes container
        notesContainer.animate({ scrollTop: $(".notesBody").height() }, "slow", function() {
            noteDiv.find(".noteTextArea").focus();
        });
    });

    //On click event for the cancel add note button
    $(document).on("click", ".noteCancel", function () {
        var articleId = $("#notesModal").data("article-id");
        populateNotes(articleId);
    });

    //On click even for the favorite icon
    $(document).on("click", ".favoriteIcon", function () {

        //Toggle between full heart icon and empty heart icon
        var makeFav = $(this).hasClass("far");
        var articleId = $(this).data("article-id");

        changeFavoriteIcon(articleId, makeFav);

        //Add or remove articleId from the local storage
        var currentFavorites = JSON.parse(localStorage.getItem(favoritesLocalStorageName));
        if (!currentFavorites) {
            currentFavorites = [];
        }

        var index = currentFavorites.indexOf(articleId);
        if (index >= 0 && !makeFav) {
            currentFavorites.splice(index, 1);
        } else if (index < 0 && makeFav) {
            currentFavorites.push(articleId);
        }

        localStorage.setItem(favoritesLocalStorageName, JSON.stringify(currentFavorites));

        //Refresh the favorite articles section in the html
        refreshFavoriteArticles();
    });

    //On click event when a user selects a link on the nav bar
    $(".navbar a").on("click", function () {
        var linkPointer = $(this).data("link-pointer");

        //Make the appropriate link display as active on the nav bar
        $(".nav-item").removeClass("active");
        if ($(this).hasClass("navbar-brand")) {
            $(`.nav-link[data-link-pointer="home"]`).parent().addClass("active");
        } else {
            $(this).parent().addClass("active");
        }

        //If hamburger menu is displayed then hide the drop down menu
        var isHamburgerDisplayed = $(".navbar-toggler").css("display") === "block" ? true : false;
        if (isHamburgerDisplayed) {
            $(".navbar-collapse").removeClass("show");
        }

        //Show or hide sections depending on what nav link was clicked
        switch (linkPointer) {
            case "home":
            default:
                $("#homeSection").show();
                $("#favoritesSection").hide();
                break;
            case "favorites":
                $("#homeSection").hide();
                $("#favoritesSection").show();
                break;
        }
    });
});