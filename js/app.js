//Business Logic
document.getElementById("test-class").innerHTML = "Paragraph changed from JS. <br> Hi Jim!";
$("#test-class").append("<br>Whaaaaazzzzuuuppp");
let dayType = "downDay";  //will let me style things, add icons etc. based on last price either being > or < prev last price. Can you pass me this please :)  


//UI
$("form#selector").submit(function (event) {
  event.preventDefault();
  let userInput = $("select#user-input").val();
  if (userInput !== "none") {
    $(".panel-body").show();
  } else {
    $(".panel-body").hide();
  }


// testing up day down day
  if (dayType === "downDay") {
    $("#panel-bias").removeClass("panel-default")
    $("#panel-bias").addClass("panel-danger") //down day
  } else if (dayType === "upDay") {
    $("#panel-bias").removeClass("panel-default")
    $("#panel-bias").addClass("panel-success") //up day
  } else {

  }
});