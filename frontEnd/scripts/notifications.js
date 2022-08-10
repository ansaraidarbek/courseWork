
document.body.addEventListener("mouseover", ()=>{
    $("#mainBody").removeClass("color1-2").addClass("color1-3");
});

document.body.addEventListener("mouseout", ()=>{
    $("#mainBody").removeClass("color1-3").addClass("color1-2");
});