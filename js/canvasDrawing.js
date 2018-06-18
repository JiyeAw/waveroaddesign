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

//*******************************************************
//variables to keep track nodes
var previous_node, node; //previous and current fabricjs node object
var currentNodeObj, previousNodeObj; //previous and current js node object
var nodeArray = []; //node storage
var nodeCount = 0; //count number of nodes created
var totalNodeCount = 0; //total number of nodes created including the deleted ones
var nodeSegment = 0; //keep track how many segment has been drawn from 1 node (max 3 seg per node)
var nodeDrawn = []; //keep track of nodes drawn on canvas
//*******************************************************
//variables to keep track segments
var pathCount = 0; //count how many paths have been created
var segArray = []; //array of segment coordinates
var segDrawn = []; //array of segment drawn on canvas
//*******************************************************
//variables to keep track Features
//speed
var speedArray = [];
var speedDrawn = [];
var speedCount = 0;
//lane end
var laneEndArray = [];
var laneEndDrawn = [];
var laneEndCount = 0;
//new lane
var laneAddArray = [];
var laneAddDrawn = [];
var laneAddCount = 0;
//on-ramp
var onRampArray = [];
var onRampDrawn = [];
var onRampCount = 0;
//off-ramp
var offRampArray = [];
var offRampDrawn = [];
var offRampCount = 0;
//*******************************************************
//draw paths
drawBtn.onclick = function() {
  canvas.hoverCursor = 'crosshair';
  canvas.selection = false;
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('object:moving');
  var isDown;
  var nodeObject = new Node();
  canvas.on('mouse:down', function(event) {
    isDown = true;
    var pointer = canvas.getPointer();
    node = createNode(pointer.x, pointer.y, null); //draw new node on canvas
    canvas.add(node); //display node onto the canvas after creating a node object
    nodeDrawn.push(node); //add a fabricjs node to array
    var active = canvas.getActiveObject(); //fabricjs object
    if (!active) {
      nodeCount++;
      totalNodeCount++;
      if (nodeCount < 10) {node.member = 'node0' + totalNodeCount; }
      else {node.member = 'node' + totalNodeCount; }
      //create a node object and store it in node array
      nodeObject = new Node(node.member, pointer.x, pointer.y, false);
      nodeArray.push(nodeObject);
      if (previous_node != null) {
        var length = nodeDrawn.length;
        //if "largest" indexed node is removed
        //previous_node takes the "second largest" indexed node
        if (previous_node.member != nodeDrawn[length - 2].id) {
          previous_node = nodeDrawn[nodeCount - 2];
        }
        currentNodeObj = nodeConvert2(node); //convert fabricjs object to JS object
        previousNodeObj = nodeConvert2(previous_node); //convert fabricjs object to JS object
        var path = createPath([previous_node.left, previous_node.top, node.left, node.top]);
        if (currentNodeObj.numberOfSegments < 3 && previousNodeObj.numberOfSegments < 3) {
          //check condition for switch case expression
          var x = currentNodeObj.hasSegment;
          var y = previousNodeObj.hasSegment;
          var xy = 0; //switch case scenario
          if (x == false && y == false) {xy = 0; }
          else if (x == false && y == true) {xy = 1; }
          //switch case takes result from xy
          switch(xy) {
            case 0: //when current node and previous node has no seg
              previous_node.path1 = null; previous_node.path2 = path;
              node.path1 = path;
              currentNodeObj.hasSegment = true;
              previousNodeObj.hasSegment = true;
              break;
            case 1: //when current node has no seg and previous node has at least 1 seg
              node.path1 = path;
              currentNodeObj.hasSegment = true;
              if (previous_node.path1 == null && previous_node.path2 != null) {
                previous_node.path1 = previous_node.path2;
                previous_node.path2 = pathl
              }
              else if (previous_node.path1 != null && previous_node.path2 == null) {
                previous_node.path2 = path;
              }
          } //end switch case
        }
        pathCount++;
        if (pathCount < 10) {path.member = 'seg0' + pathCount; }
        else {path.member = 'seg' + pathCount; }
        //create a segment object and store it in segArray
        var segment = new Segment(path.member, previousNodeObj, currentNodeObj);
        //modifying js active object and js latest object
        currentNodeObj.numberOfSegments++; //increment number of segments in 1 nodeObject
        currentNodeObj.segConnected.push(segment); //add connected seg to nodeObject
        currentNodeObj.nodeConnected.push(previousNodeObj); //add connected node to nodeObject
        previousNodeObj.numberOfSegments++;
        previousNodeObj.segConnected.push(segment);
        previousNodeObj.nodeConnected.push(currentNodeObj);
        //adding segmentObject and segment drawn object to segArray and segDrawn
        segArray.push(segment); //segmentObject
        segDrawn.push(path); //segment fabricjs object
        canvas.add(path);
        canvas.sendToBack(path);
        //always update footer's contents when canvas is modified
        footerUpdate();
        canvas.renderAll();
      }
      previous_node = node;
    } else {
      canvas.remove(node); //remove additional node when clicking the active node
      canvas.renderAll();
      }
    //always update footer's contents when canvas is modified
    footerUpdate();
  });
} //end of draw paths
//cursor button
cursorBtn.onclick = function() {
  //always update footer's contents when canvas is modified
  footerUpdate();
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.selection = true;
  canvas.hoverCursor = 'pointer';
  canvas.on('mouse:wheel', function(options) { //zoom when mouse on wheel
    var delta = options.e.deltaY;
    var pointer = canvas.getPointer();
    var zoom = canvas.getZoom();
    zoom = zoom + delta/750;
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
    var active = canvas.getActiveObject();
    //prevent objects from scaling
    if (active != null) {active.hasControls = false; }
    this.isDragging = false;
    this.selection = true;
    if (active == null) return;
    if (active.type == 'node') {
      var object = compareNode(active);
      createNodeForm(object, active);
    }
    else if (active.type == 'segment') {
      var object = compareSegment(active);
      createSegmentForm(object, active);
    }
    else if (active.type == 'speed') {
      var object = compareSpeed(active);
      createSpeedForm(object, active);
    }
    else if (active.type == 'laneEnd') {
      var object = compareLane(active);
      createLaneEndForm(object, active);
    }
    else if (active.type == 'laneAdd') {
      var object = compareLane(active);
      createLaneAddForm(object, active);
    }
    else if (active.type == 'onRamp' || active.type == 'offRamp') {
      var object = compareRamp(active);
      createRampForm(object, active);
    }
  });
  canvas.on('object:moving', function(e) {
    var p = e.target;
    //node movement setup
    p.path1 && p.path1.set({ 'x1': p.left, 'y1': p.top });
    p.path2 && p.path2.set({ 'x2': p.left, 'y2': p.top });
    // p.path3 && p.path3.set({ 'x2': p.left, 'y2': p.top });
    //********************************************************
    //intersection between feature(s) and seg setup
    var previous_seg;
    if (p.type == 'speed' || p.type == 'laneEnd' || p.type == 'laneAdd' ||
        p.type == 'onRamp' || p.type == 'offRamp') {
          p.setCoords();
          canvas.forEachObject(function(obj) {
            if (obj === p) return;
            if (obj.type != 'node') {
              obj.set('opacity', p.intersectsWithObject(obj) ? 0.5 : 1);
              var feature;
              var seg = compareSegment(obj); //convert a segment from fabricjs object to javascript object
              var previous_seg; //keep track of what the seg was connected to the feature
              if (previous_seg == null || p.intersectsWithObject(previous_seg) == false) {
                if (p.intersectsWithObject(obj) == true) {
                  if (p.type == 'speed') {feature = compareSpeed(p); }
                  if (p.type == 'laneEnd') {feature = compareLane(p); }
                  if (p.type == 'laneAdd') {feature = compareLane(p); }
                  if (p.type == 'onRamp') {feature = compareRamp(p); }
                  if (p.type == 'offRamp') {feature = compareRamp(p); }
                  feature.belongSegment = true;
                  feature.onSeg = seg;
                  if (seg.listOfFeatures.includes(feature) == false) {
                    seg.listOfFeatures.push(feature);
                    seg.numberOfFeatures++;
                  }
                  previous_seg = seg;
                } else {
                  if (p.type == 'speed') {feature = compareSpeed(p); }
                  if (p.type == 'laneEnd') {feature = compareLane(p); }
                  if (p.type == 'laneAdd') {feature = compareLane(p); }
                  if (p.type == 'onRamp') {feature = compareRamp(p); }
                  if (p.type == 'offRamp') {feature = compareRamp(p); }

                  //delete a feature of out segment
                  if (seg != null) {
                    for (var i = 0; i < seg.listOfFeatures.length; i++) {
                      if (feature.id == seg.listOfFeatures[i].id) {
                        seg.listOfFeatures.splice(i, 1);
                        feature.onSeg = null;
                        feature.belongSegment = false;
                        if (seg.listOfFeatures.length > 0) {seg.numberOfFeatures--; }
                        else {seg.numberOfFeatures = 0; }
                      }
                    } //end for loop
                  } //end if (seg != null)
                } //end else
              }
            }
          });
    }
    canvas.renderAll(); //re-render canvas when completing tasks
  });
} //end of cursorBtn
//delete button
deleteBtn.onclick = function() {
  canvas.off('mouse:down');
  canvas.off('mouse:up');
  canvas.hoverCursor = 'pointer';
  canvas.selection = true;
  var active = canvas.getActiveObjects();
  deleteObjects(active);
  //always update footer's contents when canvas is modified
  footerUpdate();
}
//********************************************************
//draw speed
speedBtn.onclick = function() { //draw speed
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('object:moving');
  canvas.selection = false;
  canvas.hoverCursor = 'pointer';
  canvas.on('mouse:down', function(e) {
    var feature = new Features();
    var active = canvas.getActiveObject();
    var pointer = canvas.getPointer();
    var elem = new fabric.Image.fromURL('img/speed.png', function(img) {
      var img1 = img.set({
        type: 'speed',
        member: '',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        scaleX: 0.5, scaleY: 0.5
      });
      img1.hasControls = false;
      if (!active) {
        speedCount++;
        if (speedCount < 10) {img1.member = 'speed0' + speedCount; }
        else {img1.member = 'speed' + speedCount; }
        canvas.add(img1);
        feature = new Features(img1.member, img1.left, img1.top, false);
        feature.type = 'speed';
        speedArray.push(feature);
        speedDrawn.push(img1);
      } else {canvas.remove(elem); }
    });
  });
  //only allow users to draw one feature at a time
  canvas.on('mouse:up', function(e) {
    canvas.off('mouse:down');
    //always update footer's contents when canvas is modified
    footerUpdate();
  });
} //end of draw speed
//draw lane ends
laneEndBtn.onclick = function() { //draw lane ends
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('object:moving');
  canvas.selection = false;
  canvas.hoverCursor = 'pointer';
  canvas.on('mouse:down', function(e) {
    var feature = new Features();
    var active = canvas.getActiveObject();
    var pointer = canvas.getPointer();
    var elem = new fabric.Image.fromURL('img/lane_ends.png', function(img) {
      var img1 = img.set({
        type: 'laneEnd',
        member: '',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        scaleX: 0.5, scaleY: 0.5
      });
      img1.hasControls = false;
      if (!active) {
        laneEndCount++;
        if (laneEndCount < 10) {img1.member = 'laneEnd0' + laneEndCount; }
        else {img1.member = 'laneEnd' + laneEndCount; }
        canvas.add(img1);
        feature = new Features(img1.member, img1.left, img1.top, false);
        feature.type = 'laneEnd';
        laneEndArray.push(feature);
        laneEndDrawn.push(img1);
      } else {canvas.remove(elem); }
    });
  });
  //only allow users to draw one feature at a time
  canvas.on('mouse:up', function(e) {
    canvas.off('mouse:down');
    //always update footer's contents when canvas is modified
    footerUpdate();
  });
} //end of lane ends
//draw new lane
newLaneBtn.onclick = function() { //draw new lane
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('object:moving');
  canvas.selection = false;
  canvas.hoverCursor = 'pointer';
  canvas.on('mouse:down', function(e) {
    var feature = new Features();
    var active = canvas.getActiveObject();
    var pointer = canvas.getPointer();
    elem = new fabric.Image.fromURL('img/new_lane.png', function(img) {
      var img1 = img.set({
        type: 'laneAdd',
        member: '',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        scaleX: 0.5, scaleY: 0.5
      });
      img1.hasControls = false;
      if (!active) {
        laneAddCount++;
        if (laneAddCount < 10) {img1.member = 'laneAdd0' + laneAddCount; }
        else {img1.member = 'laneAdd' + laneAddCount; }
        canvas.add(img1);
        feature = new Features(img1.member, img1.left, img1.top, false);
        feature.type = 'laneAdd';
        laneAddArray.push(feature);
        laneAddDrawn.push(img1);
      } else {canvas.remove(elem); }
    });
  });
  //only allow users to draw one feature at a time
  canvas.on('mouse:up', function(e) {
    canvas.off('mouse:down');
    //always update footer's contents when canvas is modified
    footerUpdate();
  });
} //end of new lane
//draw on ramp
onRampBtn.onclick = function() { //draw on ramp
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('object:moving');
  canvas.selection = false;
  canvas.hoverCursor = 'pointer';
  canvas.on('mouse:down', function(e) {
    var feature = new Features();
    var active = canvas.getActiveObject();
    var pointer = canvas.getPointer();
    elem = new fabric.Image.fromURL('img/onramp.png', function(img) {
      var img1 = img.set({
        type: 'onRamp',
        member: '',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        scaleX: 0.5, scaleY: 0.5
      });
      img1.hasControls = false;
      if (!active) {
        onRampCount++;
        if (onRampCount < 10) {img1.member = 'onRamp0' + onRampCount; }
        else {img1.member = 'onRamp' + onRampCount; }
        canvas.add(img1);
        feature = new Features(img1.member, img1.left, img1.top, false);
        feature.type = 'onRamp';
        onRampArray.push(feature);
        onRampDrawn.push(img1);
      } else {canvas.remove(elem); }
    });
  });
  //only allow users to draw one feature at a time
  canvas.on('mouse:up', function(e) {
    canvas.off('mouse:down');
    //always update footer's contents when canvas is modified
    footerUpdate();
  });
} //end of on ramp
//draw off ramp
offRampBtn.onclick = function() { //draw off off ramp
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('object:moving');
  canvas.selection = false;
  canvas.hoverCursor = 'pointer';
  canvas.on('mouse:down', function(e) {
    var feature = new Features();
    var active = canvas.getActiveObject();
    var pointer = canvas.getPointer();
    elem = new fabric.Image.fromURL('img/exit.jpg', function(img) {
      var img1 = img.set({
        type: 'offRamp',
        member: '',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        scaleX: 0.5, scaleY: 0.5
      });
      img1.hasControls = false;
      if (!active) {
        offRampCount++;
        if (offRampCount < 10) {img1.member = 'offRamp0' + offRampCount; }
        else {img1.member = 'offRamp' + offRampCount; }
        canvas.add(img1);
        feature = new Features(img1.member, img1.left, img1.top, false);
        feature.type = 'offRamp';
        offRampArray.push(feature);
        offRampDrawn.push(img1);
      } else {canvas.remove(elem); }
    });
  });
  //only allow users to draw one feature at a time
  canvas.on('mouse:up', function(e) {
    canvas.off('mouse:down');
    //always update footer's contents when canvas is modified
    footerUpdate();
  });
} //end of off ramp
//*******************************************************
