//this file processes a segment info

//return a javascript object within segArray that has
//a similar memberID as the currently active object
function compareSegment(activeObject) {
  for (var i = 0; i < segArray.length; i++) {
    if (activeObject.member == segArray[i].id) {return segArray[i]; }
  }
}

//calculate a segment length based on x and y coordinates
function calcPathLength(startX, startY, endX, endY) {
  var minX = endX - startX;
  var minY = endY - startY;
  return Math.ceil(Math.sqrt((minX*minX)+(minY*minY))); //round up to nearest integer
}

//create a segment between 2 nodes
//coords are obtained from nodes
function createPath(coords) {
  return new fabric.Line(coords, {
    type: 'segment',
    member: '',
    strokeWidth: 5,
    stroke: 'red', //'#999797'
    originX: 'center',
    originY: 'center',
    hasControls: false,
    hasBorders: false
  });
}

//return true if a node has at least 1 path
//return false if a node has no path
function isConnected(node) {
  if (node.hasSegment == false) {return true; }
  else {return false; }
}

//check if 2 segment is connected
//return true if connected and false if not
function neighbourNodes(node1, node2) {
  var maxSeg = 3; //maximum segments can be connected to 1 node
  var connected = false;
  for (var i = 0; i < maxSeg; i++) {
    for (var j = 0; j < maxSeg; j++) {
      if (node1.nodeConnected[i] == node2.nodeConnected[j]) {
        connected = true;
        return connected;
      }
    }
  }
  return connected;
}

//return nodeObject from respected active fabricjs object
function compareNode(active) {
  for (var i = 0; i < nodeArray.length; i++) {
    if (active.member == nodeArray[i].id) {return nodeArray[i]; }
  }
}

//parameters:
//left and top represent x and y
//path1, path2, path3 represent maximum number of segment that a node can take
function createNode(left, top, path1, path2) {
  var node = new fabric.Circle({
    type: 'node',
    member: '',
    left: left,
    top: top,
    originX: 'center',
    originY: 'center',
    strokeWidth: 5,
    radius: 12,
    fill: '#fff',
  });
  //first node is special so the color is different
  if (totalNodeCount == 0) {
    node.stroke = '#4c92af';
    node.radius = 15;
    node.strokeWidth = 8;
  }
  else {node.stroke = '#666'; }

  node.hasControls = node.hasBorders = false;

  node.path1 = path1;
  node.path2 = path2;

  return node;
}

//calculate the distance between an active node and all nodes
//then sort out the minimum distance
//return the nearest node object of a disconnected node
//disconected node has no connection to any notes
//disconnected node is also an active node (fabricjs object)
function findNearestNode(activeNode) {
  var storage = []; //store distance between nodes
  var nearest; //closest node to activeNode
  var smallest = 5000; //smallest distance in storage. Pre-defined: 5000m
  for (var i = 0; i < nodeArray.length; i++) {
    var nodesDistance = calcNodesDistance(activeNode, nodeArray[i]);
    storage.push(nodesDistance);
    if (storage[i] < smallest && storage[i] > 10) {
      smallest = storage[i];
      nearest = nodeArray[i];
    }
  }
  return nearest;
}

//calculate distance between one node to another
//node1 is fabricjs active object
//node2 is javascript object
function calcNodesDistance(node1, node2) {
  var minX = node1.left - node2.xCoord;
  var minY = node1.top - node2.yCoord;
  return Math.sqrt((minX*minX)+(minY*minY));
}

//convert a nodeObject into a fabricjs object
//return fabricjs object
function nodeConvert1(nodeObject) {
  for (var i = 0; i < nodeDrawn.length; i++) {
    if (nodeObject.id == nodeDrawn[i].member) {return nodeDrawn[i]; }
  }
}

//convert a fabricjs object into a nodeObject
//return nodeObject
function nodeConvert2(node) {
  for(var i = 0; i < nodeArray.length; i++) {
    if (node.member == nodeArray[i].id) {return nodeArray[i]; }
  }
}

//function to delete one or multiple objects on canvas
//this function also deletes one or multiple javascript
//objects from object array
function deleteObjects(activeObject) {
  if (activeObject) {
    activeObject.forEach(function(object) {
      //if fabricjs object is not a segment or the first node then delete object
      if (object.type != 'segment' && object.member != 'node01') {canvas.remove(object); }
      //*******************************************************
      //clean up related arrays and counts according to fabricjs object
      //if object is node
      if (object.type == 'node') {
        if (object.member == 'node01') {
          alert('Invalid request!');
          return;
        }
        var nodeList = []; //store previously connected nodes
        //when deleting a node, all segments and
        //features on those segments will be deleted
        for (var i = 0; i < nodeArray.length; i++) {
          if (object.member == nodeArray[i].id) {
            //this loop runs segDrawn[j]
            //compare connected seg of nodeArray[i] to segDrawn[j]
            for (var j = 0; j < segArray.length; j++) {
              //this loop checks within nodeArray[i].segConnected array
              //segConnected.length is always less than or equal to 3
              for (var k = 0; k < nodeArray[i].segConnected.length; k++) {
                var neighbourNode = nodeArray[i].nodeConnected[k];
                //this loop checks within neighbourNode.segConnected array
                //segConnected.length is always less than or equal to 3
                //modify neighbour nodes of nodeArray[i]
                for (var x = 0; x < neighbourNode.segConnected.length; x++) {
                  if (nodeArray[i].id == neighbourNode.nodeConnected[x].id) {
                    neighbourNode.nodeConnected.splice(x, 1);
                    neighbourNode.segConnected.splice(x, 1);
                    //if neighbourNode is fully disconnected
                    if (neighbourNode.nodeConnected.length == 0) {
                      neighbourNode.hasSegment = false;
                      neighbourNode.numberOfSegments = 0;
                    }
                  }
                } // end of for loop x = 0
                //delete all connected segments with that node
                //including fabricjs object and segmentObject
                if (nodeArray[i].segConnected[k].id == segDrawn[j].member) {
                  deleteSegmentInFeatures(segArray[j]);
                  var seg = compareSegment(segDrawn[j]); //convert fabricjs seg object to js object
                  //get 2 nodes that was disconnected from deleting active node
                  if (object.member == seg.head.id) {nodeList.push(seg.tail); }
                  else if (compareNode(object).id == seg.tail.id) {nodeList.push(seg.head); }
                  canvas.remove(segDrawn[j]);
                  segDrawn.splice(j, 1);
                  segArray.splice(j, 1);
                }
              } //end of for loop k = 0
            } //end of for loop j = 0
            //delete nodeObject and node fabricjs object out of nodeArray and nodeDrawn
            nodeArray.splice(i, 1); nodeDrawn.splice(i, 1);
            nodeCount = nodeArray.length;
            pathCount = segArray.length;

            //codes below creating new path between 2 neighbour nodes
            //after deleting active node
            //*******************************************************
            //and connect them together
            //create a new segment if its not 2 beginning and ending node
            //nodeList has to have at least 2 nodes to execute path drawing
            if (nodeList.length > 1) {
              var path = createPath([nodeList[0].xCoord, nodeList[0].yCoord, nodeList[1].xCoord, nodeList[1].yCoord]);
            } else {
              //always update footer's contents when canvas is modified
              footerUpdate();
              canvas.renderAll();
              return; //exit
            }
            var x = nodeList[0].hasSegment; //previous node
            var y = nodeList[1].hasSegment; //current node
            var node1 = nodeConvert1(nodeList[0]); //fabricjs object
            var node2 = nodeConvert1(nodeList[1]); //fabricjs object
            var xy = 0; //switch case scenario
            if (x == false && y == false) {xy = 0; }
            else if (x == false && y == true) {xy = 1; }
            else if (x == true && y == false) {xy = 2; }
            else if (x == true && y == true) {xy = 3; }
            //switch case takes result from xy
            switch (xy) {
              case 0: //when 2 nodes have no seg
                node1.path1 = null; node1.path2 = path;
                node2.path1 = path;
                nodeList[0].hasSegment = true;
                nodeList[1].hasSegment = true;
                break;
              case 1: //when node1 has no seg and node2 has 1 seg
                node1.path1 = path;
                nodeList[0].hasSegment = true;
                if (node2.path1 == null && node2.path2 != null) {
                  node2.path1 = node2.path2;
                  node2.path2 = path;
                }
                else if (node2.path1 != null && node2.path2 == null) {
                  node2.path2 = path;
                }
                break;
              case 2: //when node1 has 1 seg and node2 has no seg
                node2.path1 = path;
                nodeList[1].hasSegment = true;
                if (node1.path1 == null && node1.path2 != null) {
                  node1.path1 = node1.path2;
                  node1.path2 = path;
                }
                else if (node1.path1 != null && node1.path2 == null) {
                  node1.path2 = path;
                }
                break;
              case 3: //when 2 nodes have 1 seg
                if (node1.path1 == null && node1.path2 != null &&
                node2.path1 == null && node2.path2 != null) {
                  node1.path1 = node1.path2;
                  node1.path2 = path;
                  node2.path1 = node2.path2;
                  node2.path2 = pathl
                }
                else if (node1.path1 == null && node1.path2 != null &&
                node2.path1 != null && node2.path2 == null) {
                  node1.path1 = node1.path2;
                  node1.path2 = path;
                  node2.path2 = path;
                }
                else if (node1.path1 != null && node1.path2 == null &&
                node2.path1 == null && node2.path2 != null) {
                  node1.path2 = path;
                  node2.path1 = node2.path2;
                  node2.path2 = path;
                }
                else if (node1.path1 != null && node1.path2 == null &&
                node2.path1 != null && node2.path2 == null) {
                  node1.path1 = node1.path2;
                  node1.path2 = path;
                  node2.path2 = path;
                }
            } //end switch case
            pathCount++;
            if (pathCount < 10) {path.member = 'seg0' + pathCount; }
            else {path.member = 'seg' + pathCount; }
            //create new js segment object
            var segment = new Segment(path.member, nodeList[0], nodeList[1]);
            //modifying js active object and js latest object
            nodeList[0].numberOfSegments++; //increment number of segments in 1 nodeObject
            nodeList[0].segConnected.push(segment); //add connected seg to nodeObject
            nodeList[0].nodeConnected.push(nodeList[1]); //add connected node to nodeObject
            nodeList[1].numberOfSegments++;
            nodeList[1].segConnected.push(segment);
            nodeList[1].nodeConnected.push(nodeList[0]);
            //adding segmentObject and segment drawn object to segArray and segDrawn
            segArray.push(segment); //segmentObject
            segDrawn.push(path); //segment fabricjs object
            canvas.add(path);
            canvas.sendToBack(path);
            //always update footer's contents when canvas is modified
            footerUpdate();
            canvas.renderAll();
            //*******************************************************
            return; //exit
          } //end if (object.member == nodeArray[i].id)
        } //end of for loop i = 0
      } //end of object.type = 'node'
      //if object is segment
      else if (object.type == 'segment') {alert('Invalid request!'); }
      else { //if object is feature
        if (object.type == 'speed') {
          for (var i = 0; i < speedArray.length; i++) {
            if (object.member == speedArray[i].id) {
              //segment (js object) associated with the active fabricjs object
              var seg = compareSpeed(object).onSeg;
              //modify segment after deleting features
              for (var j = 0; i < seg.listOfFeatures.length; j++) {
                if (seg.listOfFeatures[j].id == object.member) {
                  seg.listOfFeatures.splice(j, 1);
                  seg.numberOfFeatures = seg.listOfFeatures.length;
                }
              }
              speedArray.splice(i, 1); speedDrawn.splice(i, 1);
              speedCount = speedArray.length;
            }
          }
        }
        else if (object.type == 'laneEnd') {
          for (var i = 0; i < laneEndArray.length; i++) {
            if (object.member == laneEndArray[i].id) {
              //segment (js object) associated with the active fabricjs object
              var seg = compareLane(object).onSeg;
              //modify segment after deleting features
              for (var j = 0; i < seg.listOfFeatures.length; j++) {
                if (seg.listOfFeatures[j].id == object.member) {
                  seg.listOfFeatures.splice(j, 1);
                  seg.numberOfFeatures = seg.listOfFeatures.length;
                }
              }
              laneEndArray.splice(i, 1); laneEndDrawn.splice(i, 1);
              laneEndCount = laneEndArray.length;
            }
          }
        }
        else if (object.type == 'laneAdd') {
          for (var i = 0; i < laneAddArray.length; i++) {
            if (object.member == laneAddArray[i].id) {
              //segment (js object) associated with the active fabricjs object
              var seg = compareLane(object).onSeg;
              //modify segment after deleting features
              for (var j = 0; i < seg.listOfFeatures.length; j++) {
                if (seg.listOfFeatures[j].id == object.member) {
                  seg.listOfFeatures.splice(j, 1);
                  seg.numberOfFeatures = seg.listOfFeatures.length;
                }
              }
              laneAddArray.splice(i, 1); laneAddDrawn.splice(i, 1);
              laneAddCount = laneAddArray.length;
            }
          }
        }
        else if (object.type == 'onRamp') {
          for (var i = 0; i < onRampArray.length; i++) {
            if (object.member == onRampArray[i].id) {
              //segment (js object) associated with the active fabricjs object
              var seg = compareRamp(object).onSeg;
              //modify segment after deleting features
              for (var j = 0; i < seg.listOfFeatures.length; j++) {
                if (seg.listOfFeatures[j].id == object.member) {
                  seg.listOfFeatures.splice(j, 1);
                  seg.numberOfFeatures = seg.listOfFeatures.length;
                }
              }
              onRampArray.splice(i, 1); onRampDrawn.splice(i, 1);
              onRampCount = onRampArray.length;
            }
          }
        }
        else if (object.type == 'offRamp') {
          for (var i = 0; i < offRampArray.length; i++) {
            if (object.member == offRampArray[i].id) {
              //segment (js object) associated with the active fabricjs object
              var seg = compareRamp(object).onSeg;
              //modify segment after deleting features
              for (var j = 0; i < seg.listOfFeatures.length; j++) {
                if (seg.listOfFeatures[j].id == object.member) {
                  seg.listOfFeatures.splice(j, 1);
                  seg.numberOfFeatures = seg.listOfFeatures.length;
                }
              }
              offRampArray.splice(i, 1); offRampDrawn.splice(i, 1);
              offRampCount = offRampArray.length;
            }
          }
        }
      }
      //*******************************************************
    });
    canvas.discardActiveObject();
  }
  canvas.renderAll();
}

//if a segment is deleted, all features which are associated
//with that segment will be set to
//onSeg = null; belongSegment = false
function deleteSegmentInFeatures(seg) {
  for (var i = 0; i < seg.listOfFeatures.length; i++) {
    seg.listOfFeatures[i].onSeg = null;
    seg.listOfFeatures[i].belongSegment = false;
  }
}
//*******************************************************
//test
// document.getElementById('calcBtn').onclick = function() {
//   var person = {name: 'John', age: '20', height: '175cm'};
//   var addon = {
//     ...person, weight: '70kg'
//   }
//   document.getElementById('trialTxt').innerHTML = person.name;
// }
