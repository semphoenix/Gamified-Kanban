function displayCreate() {
    let div = document.getElementById("create-new-task-block");
    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
    
}