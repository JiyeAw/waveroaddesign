//setup DOM elements
var infoContainer = document.getElementById('infoContainer');
var zoomSlider = document.getElementById('zoomSlider');

var infoTxt1 = document.getElementById('infoTxt1');
var infoTxt2 = document.getElementById('infoTxt2');
var infoTxt3 = document.getElementById('infoTxt3');

//*******************************************************
//footer's content
//automatically displays on footer
infoTxt1.innerHTML = 'Nodes: ' + 0;
infoTxt2.innerHTML = 'Segments: ' + 0;
infoTxt3.innerHTML = 'Features: ' + 0;

function footerUpdate() {
  var featureCount = speedCount + laneEndCount + laneAddCount + onRampCount + offRampCount;

  infoTxt1.innerHTML = 'Nodes: ' + nodeCount;
  infoTxt2.innerHTML = 'Segments: ' + pathCount;
  infoTxt3.innerHTML = 'Features: ' + featureCount;
}

//*******************************************************
//zooming slider
zoomSlider.oninput = function (opt) {
  var delta = this.value;
  console.log(delta);
  var zoom = canvas.getZoom();
  zoom = (5/100)*delta;
  if (zoom > 5) zoom = 5;
  if (zoom < 0.1) zoom = 0.1;
  canvas.setZoom(zoom);
}
