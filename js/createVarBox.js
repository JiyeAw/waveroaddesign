//*******************************************************
//property form
var propertyForm = document.getElementById('propertyForm');
//labels and input fields
var input1 = document.getElementById('input1');
var input2 = document.getElementById('input2');
var input3 = document.getElementById('input3');
var input4 = document.getElementById('input4');
var input5 = document.getElementById('input5');
var input6 = document.getElementById('input6');
var input7 = document.getElementById('input7');
var input8 = document.getElementById('input8');
var lb1 = document.getElementById('lb1');
var lb2 = document.getElementById('lb2');
var lb3 = document.getElementById('lb3');
var lb4 = document.getElementById('lb4');
var lb5 = document.getElementById('lb5');
var lb6 = document.getElementById('lb6');
var btn = document.getElementById('fieldUpdateBtn');
//display text for radio button in offRamp form
var offRamp_txt1 = document.getElementById('p1');
var offRamp_txt2 = document.getElementById('p2');
//*******************************************************
//global variable
var pathLength;
//*******************************************************
function disabledInputsForm() {
  propertyForm.reset();
  btn.style.display = 'none';
  offRamp_txt1.style.display = 'none';
  offRamp_txt2.style.display = 'none';
  lb1.style.display = 'none';
  lb2.style.display = 'none';
  lb3.style.display = 'none';
  lb4.style.display = 'none';
  lb5.style.display = 'none';
  lb6.style.display = 'none';
  input1.style.display = 'none';
  input2.style.display = 'none';
  input3.style.display = 'none';
  input4.style.display = 'none';
  input5.style.display = 'none';
  input6.style.display = 'none';
  input7.style.display = 'none';
  input8.style.display = 'none';
  input1.disabled = false;
  input2.disabled = false;
  input3.disabled = false;
  input4.disabled = false;
  input5.disabled = false;
  input6.disabled = false;
}

//*******************************************************
//node is a javascript object
//active is a fabricjs object
function createNodeForm(node, active) {
  disabledInputsForm();
  btn.style.display = 'block';
  //modifying nodeObject coords to its run-time coords
  node.xCoord = active.left;
  node.yCoord = active.top;

  lb1.style.display = 'block';
  lb1.innerHTML = 'NodeID';
  input1.style.display = 'block';
  input1.disabled = true;
  input1.placeholder = node.id;

  lb2.style.display = 'block';
  lb2.innerHTML = 'Neighbour nodes';
  input2.style.display = 'block';
  input2.disabled = true;
  input2.placeholder = 'none';
  if (node.numberOfSegments > 0) {
    for (var i = 0; i < node.nodeConnected.length; i++) {
       var nodeID = node.nodeConnected[i].id;
       if (input2.placeholder == 'none') {input2.placeholder = nodeID; }
       else {input2.placeholder = input2.placeholder + ', ' + nodeID; }
    }
  }

  lb3.style.display = 'block';
  lb3.innerHTML = 'Neighbour segments';
  input3.style.display = 'block';
  input3.disabled = true;
  input3.placeholder = 'none';
  if (node.numberOfSegments > 0) {
    for (var i = 0; i < node.segConnected.length; i++) {
      var segID = node.segConnected[i].id;
      if (input3.placeholder == 'none') {input3.placeholder = segID; }
      else {input3.placeholder = input3.placeholder + ', ' + segID;}
    }
  }
  if (active.member == 'node01') {
    lb4.style.display = 'block';
    lb4.innerHTML = 'Initial Speed';
    input4.style.display = 'block';
    input4.placeholder = 'km/h';

    lb5.style.display = 'block';
    lb5.innerHTML = 'Initial Lanes';
    input5.style.display = 'block';
    input5.placeholder = 'Number of lanes';

    lb6.style.display = 'block';
    lb6.innerHTML = 'Inflow';
    input6.style.display = 'block';
    input6.placeholder = 'Number of vehicles';

    btn.onclick = function () {
      node.initialSpeed = input4.value;
      node.initialLanes = input5.value;
      node.inflow = input6.value;
    }

    if (node.initialSpeed != null && node.initialLanes != null && node.inflow != null) {
      input4.value = node.initialSpeed;
      input5.value = node.initialLanes;
      input6.value = node.inflow;
    }
  }
}

function createSegmentForm(segment, active) {
  disabledInputsForm();
  btn.style.display = 'block';
  //modifying speedObj coords to its run-time coords
  segment.startX = active.x1;
  segment.startY = active.y1;
  segment.endX = active.x2;
  segment.endY = active.y2;

  lb1.style.display = 'block';
  lb1.innerHTML = 'SegmentID';
  input1.style.display = 'block';
  input1.disabled = true;
  input1.placeholder = segment.id;

  lb2.style.display = 'block';
  lb2.innerHTML = 'Path-length';
  input2.style.display = 'block';
  segment.length = calcPathLength(segment.startX, segment.startY, segment.endX, segment.endY);
  input2.placeholder = segment.length + ' m';

  lb3.style.display = 'block';
  lb3.innerHTML = 'Radius';
  input3.style.display = 'block';
  input3.placeholder = 'in metres'

  lb4.style.display = 'block';
  lb4.innerHTML = 'Super-elevation';
  input4.style.display = 'block';
  input4.placeholder = 'in percentage'

  btn.onclick = function() {
    if (input2.value != null) {segment.abstractLength = input2.value; }
    else {input2.value = 0; }
    if (input3.value != null && input4.value != null) {
      segment.gradient = parseFloat(input3.value);
      segment.superElevation = parseFloat(input4.value);
    }
  }
  if (segment.abstractLength != null && segment.gradient != null &&
      segment.superElevation != null) {
    input2.value = segment.abstractLength;
    input3.value = segment.gradient;
    input4.value = segment.superElevation;
  }
}

function createSpeedForm(feature, active) {
  disabledInputsForm();
  btn.style.display = 'block';
  //modifying speedObj coords to its run-time coords
  feature.xCoord = active.left;
  feature.yCoord = active.top;

  lb1.style.display = 'block';
  lb1.innerHTML = 'SpeedID';
  input1.style.display = 'block';
  input1.disabled = true;
  input1.placeholder = feature.id;

  lb2.style.display = 'block';
  lb2.innerHTML = 'Speed';
  input2.style.display = 'block';
  input2.placeholder = 0 +' km/h';
  btn.onclick = function() {
    if (input2.value > 0) {
      feature.speed = input2.value;
    }
  }

  if (feature.speed != null) {input2.value = feature.speed; }

  lb3.style.display = 'block';
  lb3.innerHTML = 'Within Segment';
  input3.style.display = 'block';
  input3.disabled = true;
  if (feature.belongSegment == false) {input3.placeholder = 'none'; }
  else {
    if (feature.onSeg != null) {input3.placeholder = feature.onSeg.id; }
    else {input3.placeholder = 'none'; }
  }
}

function createLaneAddForm(feature, active) {
  disabledInputsForm();
  btn.style.display = 'block';
  feature.xCoord = active.left;
  feature.yCoord = active.top;

  lb1.style.display = 'block';
  lb1.innerHTML = 'LaneID';
  input1.style.display = 'block';
  input1.disabled = true;
  input1.value = feature.id;

  lb2.style.display = 'block';
  lb2.innerHTML = 'Number of Lanes';
  input2.style.display = 'block';
  input2.type = 'number';

  lb3.style.display = 'block';
  lb3.innerHTML = 'Within Segment';
  input3.style.display = 'block';
  input3.disabled = true;
  if (feature.belongSegment == false) {input3.placeholder = 'none'; }
  else {input3.placeholder = feature.onSeg.id; }
  btn.onclick = function() {
    if (input2.value != null) {feature.numberOfLanes = parseInt(input2.value); }
  }
  if (feature.numberOfLanes == null) {input2.placeholder = 0; }
  else {input2.placeholder = feature.numberOfLanes; }
}

function createLaneEndForm(feature, active) {
  disabledInputsForm();
  btn.style.display = 'block';
  feature.xCoord = active.left;
  feature.yCoord = active.top;

  lb1.style.display = 'block';
  lb1.innerHTML = 'LaneID';
  input1.style.display = 'block';
  input1.disabled = true;
  input1.value = feature.id;

  lb2.style.display = 'block';
  lb2.innerHTML = 'Number of Lanes';
  input2.style.display = 'block';
  input2.type = 'number';

  lb3.style.display = 'block';
  lb3.innerHTML = 'Taper length';
  input3.style.display = 'block';
  input3.type = 'number';
  // input3.placeholder = 0;
  btn.onclick = function() {
    if (input2.value != null) {feature.numberOfLanes = parseInt(input2.value); }
    if (input3.value != null) {feature.taperLength = parseInt(input3.value); }
  }

  if (feature.numberOfLanes == null && feature.taperLength == null) {
    input2.placeholder = 0;
    input3.placeholder = 0;
  } else {
    input2.placeholder = feature.numberOfLanes;
    input3.placeholder = feature.taperLength;
  }

  lb4.style.display = 'block';
  lb4.innerHTML = 'Within Segment';
  input4.style.display = 'block';
  input4.disabled = true;
  if (feature.belongSegment == false) {input4.placeholder = 'none'; }
  else {input4.placeholder = feature.onSeg.id; }
}

function createRampForm(feature, active) {
  disabledInputsForm();
  btn.style.display = 'block';
  feature.xCoord = active.left;
  feature.yCoord = active.top;

  lb1.style.display = 'block';
  lb1.innerHTML = 'RampID';
  input1.style.display = 'block';
  input1.disabled = true;
  input1.value = feature.id;

  lb2.style.display = 'block';
  lb2.innerHTML = 'Within Segment';
  input2.style.display = 'block';
  input2.disabled = true;
  if (feature.belongSegment == false) {input2.placeholder = 'none'; }
  else {input2.placeholder = feature.onSeg.id; }

  if (feature.type == 'offRamp') {
    lb3.style.display = 'block';
    lb3.innerHTML = 'Lanes after off-ramp';
    if (feature.belongSegment == true) {
      input7.disabled = false;
      input8.disabled = false;
    } else {
      input7.disabled = true;
      input8.disabled = true;
    }
    input7.style.display = 'block';
    offRamp_txt1.style.display = 'inline';
    offRamp_txt1.innerHTML = 'Unaltered';
    input8.style.display = 'block';
    offRamp_txt2.style.display = 'inline';
    offRamp_txt2.innerHTML = 'Reduced';
    btn.onclick = function() {
      if (input7.checked == true && input8.checked == false) {
        feature.lane = true;
      }
      else if (input7.checked == false && input8.checked == true) {
        feature.lane = false;
      }
    }
    //display user last checked radio options
    //default value is always feature.lane = false
    if (feature.lane == true) {input7.checked = true; }
    else {input8.checked = true; }
  }
}
//*******************************************************
