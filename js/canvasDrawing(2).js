//set up variables
var canvas = new fabric.Canvas('canvas');
var canvasOffset = $('#canvas').offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;

//accordion buttons
var varBox = document.getElementById('varBox');
var speedBtn = document.getElementById('speedBtn');
var laneEndBtn = document.getElementById('laneEndBtn');
var newLaneBtn = document.getElementById('newLaneBtn');
var onRampBtn = document.getElementById('onRampBtn');
var offRampBtn = document.getElementById('offRampBtn');

var propertyForm = document.getElementById('propertyForm');
//*******************************************************
//variables to keep track segments
var seg_startX, seg_startY; //beginning seg(x,y)
var seg_endX, seg_endY; //end seg(x,y)
var pathCount = 0; //count how many paths have been created
var pathLength = 0; //path length
var curvage = 0; //how curve a segment is
var superElevation = 0; //how much elevation in a segment
var numberOfFeatures = 0; //how many features in a segment
var segArray = []; //array of segment coordinates
//*******************************************************
//variables to keep track Features
var featureArray = [];
var speedArray = [];
var speedCount = 0;
var laneArray = [];
var laneCount = 0;
var rampArray = [];
var rampCount = 0;
var belongSegment = false;
//*******************************************************
//create new path based on previous line
function createNewPath(segment) {
  var startX = segment.endX;
  var startY = segment.endY;
  var endX = segment.endX + segment.length;
  var endY = segment.endY;
  var newPath = new fabric.Line(
    [startX, startY, endX, endY],
    {
      member: '',
      strokeWidth: 10,
      stroke: '#999797',
      originX: 'center',
      originY: 'center',
      lockScalingY: true,
      lockRotation: true,
      hasBorders: false,
      cornerSize: 4,
      cornerStyle: 'circle',
      subTargetCheck: true
  });
  canvas.add(newPath);
  pathCount++;
  if (pathCount < 10) {newPath.member = 'seg0'+ pathCount; }
  else {newPath.member = 'seg' + pathCount; }//name a segment
  //create a segment object and store it in segArray
  var newSegment = new Segment(newPath.member, startX, startY, endX, endY, curvage, superElevation, numberOfFeatures);
  segArray.push(newSegment);
  createSegmentForm(newSegment);
  newPath.on('mousedown', function(event) {
    var active = canvas.getActiveObject();
    var object = compareSegment(active);
    if (event.e.altKey === true) {createNewPath(object); }
  });
} //end createNewPath
//*******************************************************
//draw paths
drawBtn.onclick = function() {
  canvas.hoverCursor = 'crosshair';
  canvas.selection = false;
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  var path, isDown;
  var segment = new Segment();
  canvas.on('mouse:down', function(event) {
    isDown = true;
    //get beginning coordinates
    var pointer = canvas.getPointer(event.e);
    seg_startX = pointer.x;
    seg_startY = pointer.y;
    var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
    path = createPath(points);
    canvas.add(path);
    path.on('mousedown', function(event) {
      var active = canvas.getActiveObject();
      var object = compareSegment(active);
      if (event.e.altKey === true) {createNewPath(object); }
    });
  });
  canvas.on('mouse:move', function(event) {
    if (!isDown) return;
    var pointer = canvas.getPointer(event.e);
    path.set({ x2: pointer.x, y2: pointer.y });
    canvas.renderAll();
  });
  canvas.on('mouse:up', function(event) {
    isDown = false;
    //get end coordinates
    var pointer2 = canvas.getPointer(event.e);
    seg_endX = pointer2.x;
    seg_endY = pointer2.y;
    //only counts path that has length
    pathLength = calcPathLength (seg_startX, seg_startY, seg_endX, seg_endY);
    if (seg_startX != seg_endX && seg_startY != seg_endY && pathLength >= 100) {
      pathCount++; //if length > 100 then pathCount + 1
      if (pathCount < 10) {path.member = 'seg0'+ pathCount; }
      else {path.member = 'seg' + pathCount; }//name a segment
      //create a segment object and store it in segArray
      segment = new Segment(path.member, seg_startX, seg_startY, seg_endX, seg_endY, curvage, superElevation, numberOfFeatures);
      segArray.push(segment);
    } else { //if length < 100
      canvas.remove(path); //delete line drawn
      disabledInputsForm(); //do not show that line's properties in the var box
    }
    createSegmentForm(segment);
  });
} //end of draw paths
//cursor button
cursorBtn.onclick = function() {
  canvas.hoverCursor = 'pointer';
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.selection = true;
  canvas.on('mouse:wheel', function(options) { //zoom when mouse on wheel
    var delta = options.e.deltaY;
    var pointer = canvas.getPointer(options.e);
    var zoom = canvas.getZoom();
    zoom = zoom + delta/200;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.1) zoom = 0.1;
    canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);
    options.e.preventDefault();
    options.e.stopPropagation();
  });
  canvas.on('mouse:down', function(options) { //panning initalised
    disabledInputsForm();
    var evt = options.e;
    if (evt.shiftKey === true) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  });
  canvas.on('mouse:move', function(options) { //pan when mouse moves
    if (this.isDragging) {
      var e = options.e;
      this.viewportTransform[4] += e.clientX - this.lastPosX;
      this.viewportTransform[5] += e.clientY - this.lastPosY;
      this.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  });
  canvas.on('mouse:up', function(options) { //panning ends
    disabledInputsForm();
    this.isDragging = false;
    this.selection = true;
    var active = canvas.getActiveObject();
    var object = compareSegment(active);
    createSegmentForm(object);
  });
} //end of cursorBtn
//delete button
deleteBtn.onclick = function() {
  canvas.hoverCursor = 'pointer';
  canvas.selection = true;
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  deleteObjects();
}
//function to delete one or multiple objects on canvas
function deleteObjects() {
	var activeObject = canvas.getActiveObject();
  var activeGroup = canvas.getActiveObjects();
    if (activeObject) {
        if (confirm('Are you sure?')) {
            canvas.remove(activeObject);
            if (pathCount < 0) {pathCount = 0; }
        }
    }
    // else if (activeGroup) {
    //     if (confirm('Are you sure?')) {
    //         var objectsInGroup = activeGroup.getObjects();
    //         canvas.discardActiveGroup();
    //         objectsInGroup.forEach(function(object) {
    //         canvas.remove(object);
    //         });
    //     }
    // }
}
//********************************************************
//draw speed
var elemSpeed;
speedBtn.onclick = function(event) { //draw speed
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.selection = false;
  canvas.hoverCursor = 'pointer';
  speedCount++;
  document.getElementById('trialTxt').innerHTML = speedCount;
  var pointer = canvas.getPointer(event.e);
  elemSpeed = new fabric.Image.fromURL('img/speed.png', function(img) {
    var img1 = img.set({
      id: 'speed' + speedCount,
      left: pointer.x - 500,
      top: pointer.y,
      scaleX: 0.5, scaleY: 0.5
    });
    canvas.add(img1);
    img1.hasControls = false;
    var feature = new Features(img1.id, img1.left, img1.top, belongSegment);
    featureArray.push(feature);
    speedArray.push(feature);
    var tlCoords = img1.oCoords.tl; //top-left coords of an element
    var active = canvas.getActiveObject();
    var object = compareFeatures(active);
    createSpeedForm(object);
  });
} //end of draw speed
//draw lane ends
var elemLaneEnd;
laneEndBtn.onclick = function(event) { //draw lane ends
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.selection = false;
  var pointer = canvas.getPointer(event.e);
  elemLaneEnd = new fabric.Image.fromURL('img/lane_ends.png', function(img) {
    var img2 = img.set({
      left: pointer.x - 700,
      top: pointer.y,
      scaleX: 0.5, scaleY: 0.5
    });
    canvas.add(img2);
    img2.hasControls = false;
    var tlCoords = img2.oCoords.tl; //top-left coords of an element
  });
  createLanesForm();
} //end of lane ends
//draw new lane
var elemNewLane;
newLaneBtn.onclick = function(event) { //draw new lane
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.selection = false;
  var pointer = canvas.getPointer(event.e);
  elemLaneEnd = new fabric.Image.fromURL('img/new_lane.png', function(img) {
    var img3 = img.set({
      left: pointer.x - 500,
      top: pointer.y,
      scaleX: 0.5, scaleY: 0.5
    });
    canvas.add(img3);
    img3.hasControls = false;
    var tlCoords = img3.oCoords.tl; //top-left coords of an element
  });
  createLanesForm();
} //end of new lane
//draw on ramp
var elemOnRamp;
onRampBtn.onclick = function(event) { //draw on ramp
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.selection = false;
  var pointer = canvas.getPointer(event.e);
  elemOnRamp = new fabric.Image.fromURL('img/onramp.png', function(img) {
    var img4 = img.set({
      left: pointer.x - 700,
      top: pointer.y,
      scaleX: 0.5, scaleY: 0.5
    });
    canvas.add(img4);
    img4.hasControls = false;
    var tlCoords = img4.oCoords.tl; //top-left coords of an element
  });
  createRampForm('On-ramp');
} //end of on ramp
//draw off ramp
var elemOffRamp;
offRampBtn.onclick = function(e) { //draw off off ramp
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.selection = false;
  var pointer = canvas.getPointer(event.e);
  elemOffRamp = new fabric.Image.fromURL('img/exit.png', function(img) {
    var img5 = img.set({
      left: pointer.x - 500,
      top: pointer.y - 200,
      scaleX: 0.5, scaleY: 0.5
    });
    canvas.add(img5);
    img5.hasControls = false;
    var tlCoords = img5.oCoords.tl; //top-left coords of an element
  });
  createRampForm('Off-ramp');
} //end of off ramp
//*******************************************************
