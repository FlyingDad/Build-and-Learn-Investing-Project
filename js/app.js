//Business Logic
document.getElementByClass("bias").innerHTML = "Paragraph changed from JS. <br> Hi Jim!";
$(".bias").append("Hey Mike");

//UI
$(function () {
  if ($("#last-price") > $("#prev-last-price")) {
    $("#panel-bias").addClass("panel-danger")
  } else if ($("#prev-last-price") > $("#last-price")) {
    $("#panel-bias").addClass("panel-success")
  } else {

  }

})


