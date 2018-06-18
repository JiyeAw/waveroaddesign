function Node() {}

//node object
function Node(id, xCoord, yCoord, hasSegment) {
  this.id = id;
  if (id == 'node01') { //Only node01 has these 3 properties
    this.intialSpeed;
    this.initialLanes;
    this.inflow;
  }
  this.xCoord = xCoord;
  this.yCoord = yCoord;
  this.hasSegment = hasSegment;
  this.segConnected = []; //js object
  this.nodeConnected = []; //js object
  if (this.hasSegment == true) {
    hasSegment = true;
    if (this.numberOfSegments > 3) {this.numberOfSegments = 3; }
  }
  else {
    hasSegment = false;
    this.numberOfSegments = 0;
  }
}

function Segment() { }

//segment object
function Segment(id, node1, node2) {
  //node1 is the active node, where mouse click is initialised
  //node2 is the nearest node to the active
  //node1 and node2 are javscript object (nodeObject)
  this.id = id;
  this.startX = node1.xCoord;
  this.startY = node1.yCoord;
  this.endX = node2.xCoord;
  this.endY = node2.yCoord;
  this.head = node1;
  this.tail = node2;
  this.listOfFeatures = [];
  this.numberOfFeatures = 0;
  this.hasFeatures;
  this.abstractLength = 0;
  this.superElevation;
  this.gradient;

  var minX = this.startX - this.endX;
  var minY = this.startY - this.endY;
  this.length = Math.ceil(Math.sqrt((minX*minX) + (minY*minY))); //round up to nearest integer
}

function Features() { }

//feature objects
function Features(id, xCoord, yCoord, belongSegment) {
  this.id = id; //feature's name
  this.xCoord = xCoord;
  this.yCoord = yCoord;
  this.belongSegment = belongSegment; //return true if it belongs to a seg
  this.onSeg; //feature belongs to what segment
  this.type; //determine which type of feature
  if (this.type == 'speed') {this.speed; }//this is an int value
  if (this.type == 'laneEnd') {
    this.taperLength; //int value
    this.numberOfLanes; //int value
  }
  if (this.type == 'laneAdd') {this.numberOfLanes; }
  if (this.type == 'offRamp') {
    //true when number of lanes is unchanged
    //false when number of lanes is reduced
    this.lane; //bool value
  }
}
