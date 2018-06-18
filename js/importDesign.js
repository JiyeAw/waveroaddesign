//import {speedArray} from 'canvasDrawing.js';
//function display (){
	//console.log ('hahah');
	//console.log(require('./canvasDrawing'));
//	console.log (speedArray[0].speed);


//}



// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn1 = document.getElementById("importFile");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var inputFile = document.getElementById('importedFile');

// When the user clicks the button, open the modal
btn1.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
	inputFile.value = '';
	//alert (inputFile.value);
	//inputField.replaceWith( inputField.value('').clone( true ) );
	//inputField.replaceWith(inputField.val('').clone(true));
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
		inputFile.value = '';
		//inputField.replaceWith( inputField.val('').clone( true ) );
    }
}

function clearCanvas(){
	canvas.clear ();
	// try to reset everything here!!!!!!------------------------------------------------------>> to be complete

	//node; //node fabrisjs object
	nodeArray = []; //node storage
	nodeCount = 0; //count number of nodes created
	nodeSegment = 0; //keep track how many segment has been drawn from 1 node (max 3 seg per node)
	nodeDrawn = []; //keep track of nodes drawn on canvas
	//*******************************************************
	//variables to keep track segments
	pathCount = 0; //count how many paths have been created
	segArray = []; //array of segment coordinates
	segDrawn = []; //array of segment drawn on canvas
	//*******************************************************
	//variables to keep track Features
	//speed
	speedArray = [];
	//module.exports.arr = speedArray;
	speedDrawn = [];
	speedCount = 0;
	//lane end --> merging lane
	laneEndArray = [];
	laneEndDrawn = [];
	laneEndCount = 0;
	//new lane
	laneAddArray = [];
	laneAddDrawn = [];
	laneAddCount = 0;
	//on-ramp
	onRampArray = [];
	onRampDrawn = [];
	onRampCount = 0;
	//off-ramp
	offRampArray = [];
	offRampDrawn = [];
	offRampCount = 0;

}


function readFile (){
	modal.style.display = "none";

	var selectedFile = inputFile.files;
	var reader = new FileReader();

	/*
	var canv = document.getElementById ('canvas');
	var ctx = canv.getContext("2d");
	ctx.clearRect(0, 0, canv.width, canv.height);
	*/
	clearCanvas ();

	if (inputFile.value == ''){
		alert ('Please Select a File to Import!');
		modal.style.display = "block";
	}else {
		//canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		reader.onload = function(e) {


			//console.log(e);
			//console.log (e.target.result);
			var receivedData = JSON.parse(e.target.result);
      console.log(receivedData);
			//console.log (result[0].Type);
			//console.log (receivedData.length);
			//var formatted = JSON.stringify(result, null, 2);
			//document.getElementById('result').value = formatted;
			//console.log (formatted);

      for (var j = 0; j < receivedData.length; j++) {
          if (receivedData[j].Type == 'segment') {
            var coords = [receivedData[j].x1, receivedData[j].y1, receivedData[j].x2, receivedData[j].y2];
            drawSegment(coords);
          }
      }

			for (var i = 0; i < receivedData.length; i ++){
				if (receivedData[i].Type == "node"){

					var cx = receivedData[i].CoordinatesX;
					var cy = receivedData[i].CoordinatesY;
					drawingNode (cx,cy);
				}
				else {
				var objType = receivedData[i].Type;
				var objMember = receivedData[i].Member;
				var objLeft = receivedData[i].CoordinatesX;
				var objTop = receivedData[i].CoordinatesY;
				var objOrgX = receivedData[i].OriginX;
				var objOrgy = receivedData[i].OriginY;
				var objBorder = receivedData[i].Has_Borders;
				var objSx = receivedData[i].ScaleX;
				var objSy = receivedData[i].ScaleY;

				drawing (objType, objMember, objLeft, objTop, objOrgX, objOrgy, objBorder, objSx, objSy);
				}
			}
		}
		reader.readAsText(selectedFile.item(0));
	}

	//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>update the footer>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.
	footerUpdate();
}

function drawSegment(coords) {
  var seg = createPath(coords);
  canvas.add(seg);
  segDrawn.push(seg);
  pathCount++;
}

function drawingNode (pointX, pointY) {
	var node = createNode(pointX, pointY, null); //draw new node on canvas
  canvas.add(node); //display node onto the canvas after creating a node object
  nodeDrawn.push(node); //add a fabricjs node to array
	nodeCount ++;
}

function drawing (objType, objMember, objLeft, objTop, objOrgX, objOrgy, objBorder, objSx, objSy) {

	var imageLoad;
	var memberLoad;

	switch(objType) {
		case "speed":
			imageLoad = 'img/speed.png';
			memberLoad = 'speed';
			speedCount ++;
			break;
		case "laneEnd":
			imageLoad = 'img/lane_ends.png';
			memberLoad = 'laneEnd';
			laneEndCount ++;
			break;
		case "laneAdd":
			imageLoad = 'img/new_lane.png';
			memberLoad = 'laneAdd';
			laneAddCount ++;
			break;
		case "onRamp":
			imageLoad = 'img/onramp.png';
			memberLoad = 'onRamp';
			onRampCount ++;
			break;
		case "offRamp":
			imageLoad = 'img/exit.png';
			memberLoad = 'offRamp';
			offRampCount ++;
			break;
	}


	var feature = new Features();
	var active = canvas.getActiveObject();
	var pointer = canvas.getPointer();
	var elem = new fabric.Image.fromURL(imageLoad, function(img) {
		var img1 = img.set({
			type: objType,
			member: objMember,
			left: objLeft,//enter the location x
			top: objTop,//enter the location y
			originX:  objOrgX,
			originY: objOrgy,
			hasBorders: objBorder,
			scaleX: objSx,
			scaleY: objSy
		});
		img1.hasControls = false;
		if (!active) {
		if (objType == "speed"){
			speedCount++;
			//numCount = speedCount;
			onCanvasDrawing (speedCount, memberLoad, img1)
		}else if (objType == "laneEnd"){
			laneEndCount++;
			//numCount = laneAddCount;
			onCanvasDrawing (laneAddCount, memberLoad, img1)
		}else if (objType == "laneAdd"){
			laneAddCount ++;
			//numCount = laneAddCount;
			onCanvasDrawing (laneAddCount, memberLoad, img1)
		}else if (objType == "onRamp"){
			onRampCount ++;
			//numCount =
			onCanvasDrawing (onRampCount, memberLoad, img1)
		}else if (objType == "offRamp"){
			offRampCount ++;
			onCanvasDrawing (offRampCount, memberLoad, img1)
		}
		} else {
			canvas.remove(elem);
		}
		// passing
		// count
		// memberLoad
		// imgl
		/*
		if (!active) {
			speedCount++;
			if (speedCount < 10) {
				img1.member = memberLoad + '0' + speedCount;
			}
			else {
				img1.member = memberLoad + speedCount;
			}
			// draw on canvas
			canvas.add(img1);
			feature = new Features(img1.member, img1.left, img1.top, false);
			feature.type = memberLoad;
			speedArray.push(feature);
			speedDrawn.push(img1);
		} else {
			canvas.remove(elem);
		}
		*/
	});
}

function onCanvasDrawing (numCount, memberLoad, loading_img) {

			//speedCount++;
			if (numCount < 10) {
				loading_img.member = memberLoad + '0' + numCount;
			}
			else {
				loading_img.member = memberLoad + numCount;
			}
			// draw on canvas
			canvas.add(loading_img);
			feature = new Features(loading_img.member, loading_img.left, loading_img.top, false);
			feature.type = memberLoad;
			speedArray.push(feature);
			speedDrawn.push(loading_img);
}






function check_cehck_button(){

	// Clear all content on the canvas
	canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

	/*
	var feature = new Features();
    var active = canvas.getActiveObject();
    var pointer = canvas.getPointer();
    var elem = new fabric.Image.fromURL('img/speed.png', function(img) {
      var img1 = img.set({
        type: 'speed',
        member: '',
        left: 50,//enter the location x
        top: 50,//enter the location y
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        scaleX: 0.5, scaleY: 0.5
      });
      img1.hasControls = false;
      if (!active) {
        speedCount++;
        if (speedCount < 10) {
			img1.member = 'speed0' + speedCount;
		}
        else {
			img1.member = 'speed' + speedCount;
		}
		// draw on canvas
        canvas.add(img1);
        feature = new Features(img1.member, img1.left, img1.top, false);
        feature.type = 'speed';
        speedArray.push(feature);
        speedDrawn.push(img1);
      } else {canvas.remove(elem); }
	});
	*/



	var i;
	for (i=0;i<speedDrawn.length;i++){
		console.log (speedDrawn[i].top  +','+ speedDrawn[i].left);
		//console.log (speedDrawn[i].hasBorders);
	}

}
