//this file is not within the project
//this file is the guide to show what can be used to connect frontEnd to backEnd

//*******************************************************
//variables to keep track nodes
var node; //node fabrisjs object
var nodeArray = []; //node storage
var nodeCount = 0; //count number of nodes created
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
var speedArray = []; //javascript object
var speedDrawn = []; //fabricjs object
var speedCount = 0;
//lane end
var laneEndArray = []; //javascript object
var laneEndDrawn = []; //fabricjs object
var laneEndCount = 0;
//new lane
var laneAddArray = []; //javascript object
var laneAddDrawn = []; //fabricjs object
var laneAddCount = 0;
//on-ramp
var onRampArray = []; //javascript object
var onRampDrawn = []; //fabricjs object
var onRampCount = 0;
//off-ramp
var offRampArray = []; //javascript object
var offRampDrawn = []; //fabricjs object
var offRampCount = 0;
//*******************************************************
//*******************************************************
function Node() {}

//node object
function Node(id, xCoord, yCoord, hasSegment) {
  this.id = id;
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
  this.numberOfFeatures = this.listOfFeatures.length;
  this.abstractLength = 0;

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
//*******************************************************
