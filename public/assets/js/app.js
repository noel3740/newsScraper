$(document).ready(function () {
    var alertDiv = $("#errorAlert");
    alertDiv.hide();

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

    //Function that creates the div that contains a specific note
    function createNoteDiv(note, index) {
        return $(`
        <div data-note-id=${note._id} class="noteContainer col-12 py-3 ${index !== 0 ? "border-top" : ""}">
            <div class="row">
                <div class="editNoteContainer px-2">
                     <div class="noteEdit">
                        <textarea data-note-id=${note._id} class="noteTextArea form-control" rows="3" placeholder="Enter note text">${note.text}</textarea>
                    </div>
                </div>
                <div class="noteButtonsContainer">
                    <div class="mb-2 mr-2">
                        <button data-note-id=${note._id} ${note.text.trim() !== "" ? "" : "disabled"} class="noteSaveBtn btn btn-secondary btn-block"><i class="fas fa-save"></i> Save</button>
                    </div>
                    <div class="mr-2">
                        <button data-note-id=${note._id} class="noteDeleteBtn btn btn-secondary btn-block ${note._id !== -1 ? "" : "d-none"}"><i class="fas fa-times"></i> Delete</button>
                        <button data-note-id=${note._id} class="noteCancel btn btn-secondary btn-block ${note._id !== -1 ? "d-none" : ""}">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `);
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

                article.notes.forEach(function (note, index) {

                    var noteDiv = createNoteDiv(note, index);

                    notesContainer.append(noteDiv);
                });

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
        notesContainer.animate({ scrollTop: $(document).height() });
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
        var noteId = parseInt($(this).data("note-id"));
        var httpMethod = noteId !== -1 ? "PUT" : "POST";
        var apiUrl = noteId !== -1 ? `/api/notes/${noteId}` : `/api/articles/${articleId}/notes`;

        const note = {
            text: $(`.noteTextArea[data-note-id=${noteId}]`).val()
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
            _id: -1
        };

        var index = $(".noteContainer").length;
        var noteDiv = createNoteDiv(newNote, index);
        notesContainer.append(noteDiv);

        noteDiv.find(".noteTextArea").focus();

        //Scroll to the bottom of the notes container
        notesContainer.animate({ scrollTop: $(document).height() }, "slow");
    });

    //On click event for the cancel add note button
    $(document).on("click", ".noteCancel", function() {
        var articleId = $("#notesModal").data("article-id");
        populateNotes(articleId);
    });

});