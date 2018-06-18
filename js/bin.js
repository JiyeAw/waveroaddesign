//within: canvasDrawing.js
//drawBtn uses another dot-to-dot system to draw the segments
//a segment is drawn by key combo ALT + left click
//an active node will be connected to the nearest node to itself
drawBtn.onclick = function() {
  canvas.hoverCursor = 'crosshair';
  canvas.selection = false;
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  canvas.off('object:moving');
  var node, path, isDown;
  var nodeObject = new Node();
  canvas.on('mouse:down', function(event) {
    isDown = true;
    var pointer = canvas.getPointer();
    node = createNode(pointer.x, pointer.y, null); //draw new node on canvas
    canvas.add(node); //display node onto the canvas after creating a node object
    nodeDrawn.push(node); //add a fabricjs node to array
    node.on('mousedown', function(event) {
      var modal = document.getElementById('modal');
      var active = canvas.getActiveObject(); //fabricjs object
      if (active) {
        if (event.e.altKey === true) {
          // modal.style.display = 'block'; //display modal
          var nearestNode = findNearestNode(active); //return nodeObject
          var activeObj = nodeConvert2(active); //convert fabricjs object to JS object
          var convertObj = nodeConvert1(nearestNode); //convert JS object to fabricjs object
          path = createPath([active.left, active.top, nearestNode.xCoord, nearestNode.yCoord]);
          var hasConnected = activeObj.nodeConnected.includes(nearestNode); //check if nearestNode is connected to activeObj
          if (activeObj.numberOfSegments < 3 && nearestNode.numberOfSegments < 3 &&
              hasConnected == false) { //make sure there's only 3 seg in 1 node and 2 nodes are not connected
            //check condition for switch case expression
            var x = activeObj.hasSegment;
            var y = nearestNode.hasSegment;
            var xy = 0; //switch case scenario
            if (x == false && y == false) {xy = 0; }
            else if (x == true && y == false) {xy = 1; }
            else if (x == false && y == true) {xy = 2; }
            else if (x == true && y == true) {xy = 3; }
            //switch case takes result from xy
            switch (xy) {
              case 0: //when active node and nearest node has no seg
                active.path1 = null; active.path2 = path;
                convertObj.path1 = path;
                activeObj.hasSegment = true;
                nearestNode.hasSegment = true;
                break;
              case 1: //when active node has at least 1 seg and nearest node has no seg
                convertObj.path1 = path;
                nearestNode.hasSegment = true;
                //when active node has 1 seg
                if (active.path1 == null && active.path2 != null) {
                  active.path1 = active.path2;
                  active.path2 = path;
                }
                else if (active.path1 != null && active.path2 == null) {
                  active.path2 = path;
                }
                //when active node has 2 seg
                if (active.path1 != null && active.path2 != null) {
                  if (active.path3 == null) {active.path3 = path; }
                }
                break;
              case 2: //when nearest has at least 1 seg and active node has no seg
                active.path1 = path;
                activeObj.hasSegment = true;
                if (convertObj.path1 == null && convertObj.path2 != null) {
                  convertObj.path1 = convertObj.path2;
                  convertObj.path2 = path;
                }
                else if (convertObj.path1 != null && convertObj.path2 == null) {
                  convertObj.path2 = path;
                }
                else if (convertObj.path1 != null && convertObj.path2 != null) {
                  if (convertObj.path3 == null) {convertObj.path3 = path; }
                }
                break;
              case 3: //when both nodes have at least 1 seg
                //when active node and nearest node both has 1 seg
                if (active.path1 != null && active.path2 == null &&
                    convertObj.path1 != null && convertObj.path2 == null) {
                      active.path2 = path;
                      convertObj.path2 = path;
                }
                else if (active.path1 == null && active.path2 != null &&
                         convertObj.path1 == null && convertObj.path2 != null) {
                      active.path1 = active.path2;
                      active.path2 = path;
                      convertObj.path1 = convertObj.path2;
                      convertObj.path2 = path;
                }
                else if (active.path1 != null && active.path2 == null &&
                         convertObj.path1 == null && convertObj.path2 != null) {
                      active.path2 = path;
                      convertObj.path1 = convertObj.path2;
                      convertObj.path2 = path;
                }
                else if (active.path1 == null && active.path2 != null &&
                         convertObj.path1 != null && convertObj.path2 == null) {
                      active.path1 = active.path2;
                      active.path2 = path;
                      convertObj.path2 = path;
                }
                //when active node has 1 seg and nearest node has 2 seg
                if (convertObj.path1 != null && convertObj.path2 != null && convertObj.path3 == null) {
                  if (active.path1 == null && active.path2 != null) {
                    active.path1 = active.path2;
                    active.path2 = path;
                  }
                  else if (active.path1 != null && active.path2 == null) {
                    active.path2 = path;
                  }
                  convertObj.path3 = path;
                }
                //when active node has 2 seg and nearest node has 1 seg
                if (active.path1 != null && active.path2 != null && active.path3 == null) {
                  if (convertObj.path1 == null && convertObj.path2 != null) {
                    convertObj.path1 = convertObj.path2;
                    convertObj.path2 = path;
                  }
                  else if (convertObj.path1 != null && convertObj.path2 == null) {
                    convertObj.path2 = path;
                  }
                  active.path3 = path;
                }
                //when active node and nearest node both has 2 seg
                if (active.path1 != null && active.path2 != null && active.path3 == null &&
                    convertObj.path1 != null && convertObj.path2 != null && convertObj.path3 == null) {
                      active.path3 = path;
                      convertObj.path3 = path;
                }
                break;
            } //end switch case
            pathCount++;
            if (pathCount < 10) {path.member = 'seg0'+ pathCount; }
            else {path.member = 'seg' + pathCount; }//name a segment
            //create a segment object and store it in segArray
            var segment = new Segment(path.member, activeObj, nearestNode);
            //modifying active object and nearestNode object
            activeObj.numberOfSegments++; //increment number of segments in 1 nodeObject
            activeObj.segConnected.push(segment); //add connected seg to nodeObject
            activeObj.nodeConnected.push(nearestNode); //add connected node to nodeObject
            nearestNode.numberOfSegments++;
            nearestNode.segConnected.push(segment);
            nearestNode.nodeConnected.push(activeObj);
            //adding segmentObject and segment drawn object to segArray and segDrawn
            segArray.push(segment); //segmentObject
            segDrawn.push(path); //segment fabricjs object
            canvas.add(path);
            canvas.sendToBack(path);
            //always update footer's contents when canvas is modified
            footerUpdate();
            canvas.renderAll();
          } else {
            if (activeObj.hasSegment == false) {
              activeObj.hasSegment = false;
              activeObj.numberOfSegments = 0;
              activeObj.path1 = activeObj.path2 = activeObj.path3 = null;
              alert('No more than 3 segments in 1 node!');
              canvas.remove(path);
            }
          }
        }
      }
    });
  });
  // canvas.on('mouse:move', function(event) {
  //   if (!isDown) return;
  //   var pointer = canvas.getPointer(event.e);
  //   path.set({ x2: pointer.x, y2: pointer.y });
  //   canvas.renderAll();
  // });
  canvas.on('mouse:up', function(event) {
    isDown = false;
    var active = canvas.getActiveObject();
    var pointer = canvas.getPointer();
    if (!active) {
      nodeCount++;
      if (nodeCount < 10) {node.member = 'node0' + nodeCount; }
      else {node.member = 'node' + nodeCount; }
      //create a node object and store it in node array
      nodeObject = new Node(node.member, pointer.x, pointer.y, false);
      nodeArray.push(nodeObject);
      //always update footer's contents when canvas is modified
      footerUpdate();
    } else {
      canvas.remove(node); //remove additional node when clicking the active node
      canvas.renderAll();
      }
  });
} //end of draw paths

//within: segmentProcessor.js
//function: deleteObjects(activeObject)
//when object.type == 'segment'
//it deletes everything which is related to the chosen segment
else if (object.type == 'segment') {
  var max = 2; //the maximum of nodes in a segment is 2
  //when deleting a segment, all nodes and features
  //related to this segment will be deleted
  for (var i = 0; i < segArray.length; i++) {
    if (object.member == segArray[i].id) {
      deleteSegmentInFeatures(segArray[i]);
      //if 2 nodes were previously connected, they will be disconnected
      //after deleting a segment between them
      //these 2 nodes are classified as head and tail of a segment
      for (var k = 0; k < segArray[i].head.nodeConnected.length; k++) { //modify segArray[i].head
        if (segArray[i].tail.id == segArray[i].head.nodeConnected[k].id) {
          segArray[i].head.nodeConnected.splice(k, 1);
        }
        if (segArray[i].head.segConnected[k].id == segArray[i].id) {
          segArray[i].head.segConnected.splice(k, 1);
          segArray[i].head.numberOfSegments--;
        }
      }
      for (var j = 0; j < segArray[i].tail.nodeConnected.length; j++) { //modify segArray[i].tail
        if (segArray[i].head.id == segArray[i].tail.nodeConnected[j].id) {
          segArray[i].tail.nodeConnected.splice(j, 1);
        }
        if (segArray[i].tail.segConnected[j].id == segArray[i].id) {
          segArray[i].tail.segConnected.splice(j, 1);
          segArray[i].tail.numberOfSegments--;
        }
      }
      if (segArray[i].head.numberOfSegments == 0) {segArray[i].head.hasSegment = false; }
      if (segArray[i].tail.numberOfSegments == 0) {segArray[i].tail.hasSegment = false; }
      segArray.splice(i, 1); segDrawn.splice(i, 1);
      pathCount = segArray.length;
      return; //exit
    }
  } //end of for loop i = 0
}
