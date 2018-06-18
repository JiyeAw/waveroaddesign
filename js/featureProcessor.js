//this file processes given Features

//return a javascript object within speedArray that has
//a similar memberID as the currently active object
function compareSpeed (activeObject) {
  for (var i = 0; i < speedArray.length; i++) {
    if (activeObject.member == speedArray[i].id) {return speedArray[i]; }
  }
}

//return a javascript object within laneEndArray or laneAddArray that has
//a similar memberID as the currently active object
function compareLane (activeObject) {
  if (activeObject.type == 'laneEnd') {
    for (var i = 0; i < laneEndArray.length; i++) {
      if (activeObject.member == laneEndArray[i].id) {return laneEndArray[i]; }
    }
  }
  else if (activeObject.type == 'laneAdd') {
    for (var i = 0; i < laneAddArray.length; i++) {
      if (activeObject.member == laneAddArray[i].id) {return laneAddArray[i]; }
    }
  }
}

//return a javascript object within onRampArray or offRampArray that has
//a similar memberID as the currently active object
function compareRamp (activeObject) {
  if (activeObject.type == 'onRamp') {
    for (var i = 0; i < onRampArray.length; i++) {
      if (activeObject.member == onRampArray[i].id) {return onRampArray[i]; }
    }
  }
  else if (activeObject.type == 'offRamp') {
    for (var i = 0; i < offRampArray.length; i++) {
      if (activeObject.member == offRampArray[i].id) {return offRampArray[i]; }
    }
  }
}

//para: segment - segment js object || featureType - feature type in string
//return the largest number of lanes in a segment
function largestNumberOfLanes(segment) {
  var biggest;
  if (segment.listOfFeatures.length != 0) {
    for (var i = 0; i < segment.listOfFeatures.length; i++) {
      if (segment.listOfFeatures[i].type == 'laneAdd') {
        if (segment.listOfFeatures[i].numberOfLane > biggest) {
          biggest = segment.listOfFeatures[i].numberOfLane;
        }
      }
    }
  }
  return biggest;
}
//img/speed.png
//create a feature at pointer's current location and
//within given local directory or URL
function createFeature (active, dir) {

}

//this function adds a feature onto a segment
//when that feature is dragged onto that segment
//return ...
function addFeature() {

}
