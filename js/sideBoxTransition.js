// open sideBox
// triggered by menuOpenerBox onclick

function openSideBox() {
    if (document.getElementById("sideBox").style.width == "0px") {
      document.getElementById("sideBox").style.width = "20%";
      document.getElementById("canvasBox").style.marginRight = "20%";
    } else {
      document.getElementById("sideBox").style.width = "0";
      document.getElementById("canvasBox").style.marginRight= "0";
    }
}
