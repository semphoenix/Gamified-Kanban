
// for implementing the ajax requests
(function ($) {

    let originalTaskColumn;

    const checkVote = (vote, varName) => {
        if (vote===undefined) throw `Error: You must supply a ${varName}!`;
        if (typeof vote !== 'number' || Number.isNaN(vote) || !Number.isInteger(vote)) throw `Error: ${varName} must be an integer number!`;
        if (vote !==0 && vote !== 1) throw `Error: ${varName} must be to-do = 0, in-progress = 1, in-review = 2, completed = 3`;
        return vote;
    }

    const statusNumbers = {
        "todo": 0,
        "inprogress": 1,
        "inreview": 2,
        "completed": 3
    }

    $(".kanban-task-block").draggable({
        revert: true,
        start: function(event, ui) {
            originalTaskColumn = $(this).parent();
        }
    });

    $(".kanban-block").droppable({
        accept: ".kanban-task-block",
        drop: function (event, ui) {
            // make sure element is not in the same column
            const block = $(this);

            if (block.attr('id') === originalTaskColumn.attr('id'))
                return;
            
            const draggedTask = ui.draggable;
            const statusName = block.attr('id');
            // task was not dragged to a task column
            if (!(statusName in statusNumbers))
                return;

            const statusNum = statusNumbers[statusName]; // get status number
            const taskId = draggedTask.data('id');
            $.ajax({
                method: "PATCH",
                url: `/kanban/changeStatus/${taskId}`,
                data: {
                    status: statusNum
                },
                async: false,
                timeout: 3000 // sets a timeout if it takes too long
            }).done(function(result) {
                const { canVote, remainingVotesNeeded } = result;
                const votesNeeded = `<p class="vote-count">Remaining Approvals Needed: ${remainingVotesNeeded}</p>`;
                if (statusName === "inreview") 
                    draggedTask.append(votesNeeded);
                else if (statusName !== "inreview") {
                    draggedTask.children(".vote-count").remove();
                    draggedTask.children(".task-vote-form").remove();
                } 

                const voteForm = `<form class="task-vote-form">
                    <label for="task-vote">Approve? </label>
                    <select class="task-vote" name="task-vote" id="task-vote" form="create-task-form">
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                    <input type="submit" value="Submit">
                    <ul class="error-list" hidden></ul>
                </form>`;
                if (canVote)
                    draggedTask.append(voteForm);
                
                block.append(draggedTask);
                console.log("task has been dragged successfully!");
            }).fail(function() {
                alert("drag failed");
            });

        },
    });

    $(".kanban-task-block").on("submit", function(event) {
        event.preventDefault();
        const task = $(this);
        const form = $(this).children(".task-vote-form");
        form.children(".error-list").hidden = true;
        let vote = form.children(".task-vote").val();
        const taskId = task.data("id");
        try {
            vote = checkVote(+vote, "vote");
        } catch(e) {
            const error = `<li>${e}</li>`;
            form.children(".error-list").append(error);
            form.children(".error-list").hidden = false;
        }

        $.ajax({
            method: "PATCH",
            url: `/kanban/vote/${taskId}`,
            data: {
                vote: vote
            }
        })
        .done(function(result) {
            const { completed, newVoteCount } = result;
            console.log(completed);
            if (completed) {
                task.remove();
                alert("task has been marked complete and will be moved to completed tasks page")
            } else {
                task.children(".vote-count").html(`<p class="vote-count">Remaining Approvals Needed: ${newVoteCount}</p>`);
                task.children(".task-vote-form").remove();
            }
        })
        .fail(function(xhr, status, error) {
            alert(error);
        });
    });

})(window.jQuery);