var exp = document.getElementById('exportFile');
exp.onclick = exportTesting;


var allObj = [];

function exportTesting (){

	var jsonObject;


	var i;
	for (i = 0; i < nodeDrawn.length; i++){
		jsonObject = new createNodeAsJSON (nodeDrawn[i] , i);
		jsonObject = JSON.stringify(jsonObject);
		allObj.push (jsonObject);
	}
	for (i = 0; i < segDrawn.length; i++){
		//jsonObject = new createFeaturesAsJSON (segDrawn[i]);
		jsonObject = JSON.stringify(segDrawn[i]);
		allObj.push (jsonObject);
	}
	for (i = 0; i < speedDrawn.length; i ++){
		//jsonObject = new createFeaturesAsJSON (speedDrawn[i]);
		jsonObject = JSON.stringify(speedDrawn[i]);
		allObj.push (jsonObject);
	}
	for (i = 0; i < laneEndDrawn.length; i++){
		//jsonObject = new createFeaturesAsJSON (laneEndDrawn[i]);
		jsonObject = JSON.stringify(laneEndDrawn[i]);
		allObj.push (jsonObject);
	}
	for (i = 0; i < laneAddDrawn.length; i++){
		//jsonObject = new createFeaturesAsJSON (laneAddDrawn[i]);
		jsonObject = JSON.stringify(laneAddDrawn[i]);
		allObj.push (jsonObject);
	}
	for (i = 0; i < onRampDrawn.length; i++){
		//jsonObject = new createFeaturesAsJSON (onRampDrawn[i]);
		jsonObject = JSON.stringify(onRampDrawn[i]);
		allObj.push (jsonObject);
	}
	for (i = 0; i < offRampDrawn.length; i++){
		//jsonObject = new createFeaturesAsJSON (offRampDrawn[i]);
		jsonObject = JSON.stringify(offRampDrawn[i]);
		allObj.push (jsonObject);
	}

	// js
	/*
	for (i = 0; i < nodeArray.length; i++){
		//jsonObject = new createFeaturesAsJSON (nodeDrawn[i]);
		jsonObject = JSON.stringify(nodeArray[i]);
		allObj.push (jsonObject);
	}

	for (i = 0; i < segArray.length; i++){
		//jsonObject = new createFeaturesAsJSON (segDrawn[i]);
		jsonObject = JSON.stringify(segArray[i]);
		allObj.push (jsonObject);
	}

	for (i = 0; i < speedArray.length; i ++){
		//jsonObject = new createFeaturesAsJSON (speedDrawn[i]);
		jsonObject = JSON.stringify(speedArray[i]);
		allObj.push (jsonObject);
	}

	for (i = 0; i < laneEndArray.length; i++){
		//jsonObject = new createFeaturesAsJSON (laneEndDrawn[i]);
		jsonObject = JSON.stringify(laneEndArray[i]);
		allObj.push (jsonObject);
	}
	*/
	for (i = 0; i < laneAddArray.length; i++){
		//jsonObject = new createFeaturesAsJSON (laneAddDrawn[i]);
		jsonObject = JSON.stringify(laneAddArray[i]);
		allObj.push (jsonObject);
	}
	for (i = 0; i < onRampArray.length; i++){
		//jsonObject = new createFeaturesAsJSON (onRampDrawn[i]);
		jsonObject = JSON.stringify(onRampArray[i]);
		allObj.push (jsonObject);
	}
	for (i = 0; i < offRampArray.length; i++){
		//jsonObject = new createFeaturesAsJSON (offRampDrawn[i]);
		jsonObject = JSON.stringify(offRampArray[i]);
		allObj.push (jsonObject);
	}


	var data = "text/json;charset=utf-8,";
	for (i = 0 ; i < allObj.length; i ++){
		if (i == 0){
			data += "[" + encodeURIComponent(allObj[i]) + ",";
		}else if (i == allObj.length-1){
			data += encodeURIComponent(allObj[i]) + "]";
		}else{
			data += encodeURIComponent(allObj[i]) + ",";
		}
	}

	// code to write json file

/*
nodeDrawn
segDrawn
speedDrawn
laneEndDrawn
laneAddDrawn
onRampDrawn
offRampDrawn
*/
	/*
	var jsonObject;


	var i;
	for (i = 0; i < nodeDrawn.length; i++){
		//if (nodeDrawn[i].member != ""){
			jsonObject = new createNodeAsJSON (nodeDrawn[i]);

			allObj.push (jsonObject);
		//}
	}
	for (i = 0; i < segDrawn.length; i++){
		jsonObject = new createSegAsJSON (segDrawn[i]);

		allObj.push (jsonObject);
	}
	for (i = 0; i < speedDrawn.length; i ++){
		jsonObject = new createFeaturesAsJSON (speedDrawn[i]);

		allObj.push (jsonObject);
	}
	for (i = 0; i < laneEndDrawn.length; i++){
		jsonObject = new createFeaturesAsJSON (laneEndDrawn[i]);

		allObj.push (jsonObject);
	}
	for (i = 0; i < laneAddDrawn.length; i++){
		jsonObject = new createFeaturesAsJSON (laneAddDrawn[i]);

		allObj.push (jsonObject);
	}
	for (i = 0; i < onRampDrawn.length; i++){
		jsonObject = new createFeaturesAsJSON (onRampDrawn[i]);

		allObj.push (jsonObject);
	}
	for (i = 0; i < offRampDrawn.length; i++){
		jsonObject = new createFeaturesAsJSON (offRampDrawn[i]);

		allObj.push (jsonObject);
	}


	var data = "text/json;charset=utf-8,";
	for (i = 0 ; i < allObj.length; i ++){
		if (i == 0){
			data += "[" + encodeURIComponent(JSON.stringify(allObj[i])) + ",";
		}else if (i == allObj.length-1){
			data += encodeURIComponent(JSON.stringify(allObj[i])) + "]";
		}else{
			data += encodeURIComponent(JSON.stringify(allObj[i])) + ",";
		}
	}
	*/




	var a = document.getElementById('exportFile');
	a.href = 'data:' + data;
	a.download = 'data.json';
	//a.innerHTML = 'download JSON';

}
/*
type: 'laneAdd',
        member: '',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        scaleX: 0.5, scaleY: 0.5
*/

function createNodeAsJSON (JsonObj, zzz){
	/*
	type: 'node',
    member: '',
    left: left,
    top: top,
    originX: 'center',
    originY: 'center',
    strokeWidth: 5,
    radius: 12,
    fill: '#fff',
    stroke: '#666'
	*/
	if (zzz == 0){
		return {
			"Type" : JsonObj.type,
			"Member" : JsonObj.member,
			"CoordinatesX" : JsonObj.left,
			"CoordinatesY" : JsonObj.top,
			"OriginX" : JsonObj.originX,
			"OriginY" : JsonObj.originY,
			"strokeWidth": 5,
			"radius": 12,
			"fill": '#fff',
			"stroke": '#666',
			"NodeStroke" : '#4c92af',
			"NodeRadius" : 15,
			"NodeStrokeWidth" : 8,
			"NodeHasControls" : false,
			"Path1" : JsonObj.path1,
			"Path2" : JsonObj.path2

		};
	}else {
		return {
			"Type" : JsonObj.type,
			"Member" : JsonObj.member,
			"CoordinatesX" : JsonObj.left,
			"CoordinatesY" : JsonObj.top,
			"OriginX" : JsonObj.originX,
			"OriginY" : JsonObj.originY,
			"strokeWidth": 5,
			"radius": 12,
			"fill": '#fff',
			"stroke": '#666',
			"NodeHasControls" : false,
			"Path1" : JsonObj.path1,
			"Path2" : JsonObj.path2
		};
	}

}

function createSegAsJSON (JsonObj){
	/*
	type: 'segment',
    member: '',
    strokeWidth: 5,
    stroke: 'red', //'#999797'
    originX: 'center',
    originY: 'center',
    hasControls: false,
    hasBorders: false,
    cornerSize: 4,
    cornerStyle: 'circle'
	*/
	return {
		"Type" : JsonObj.type,
		"Member" : JsonObj.member,
		"StrokeWidth": 5,
		"Stroke": 'red', //'#999797'
		"OriginX" : JsonObj.originX,
		"OriginY" : JsonObj.originY,
		"HasControls": false,
		"HasBorders": false,
		"CornerSize": 4,
		"CornerStyle": 'circle'
	}
}

// call function and pass object
function createFeaturesAsJSON (JsonObj){
	return {
		"Type" : JsonObj.type,
		"Member" : JsonObj.member,
		"CoordinatesX" : JsonObj.left,
		"CoordinatesY" : JsonObj.top,
		"OriginX" : JsonObj.originX,
		"OriginY" : JsonObj.originY,
		"Has_Borders" : JsonObj.hasBorders,
		"ScaleX" : JsonObj.scaleX,
		"ScaleY" : JsonObj.scaleY

	};
}

function createArrayAdJSON (ArrayJsonObj){
	/*
		this.id = id; //feature's name
  this.xCoord = xCoord;
  this.yCoord = yCoord;
  this.belongSegment = belongSegment; //return true if it belongs to a seg
  this.onSeg; //feature belongs to what segment
  this.type;


	*/
	if (this.type == 'speed') {
		return {
		"ID" : ArrayJsonObj.member,
		"XCoord" : ArrayJsonObj.left,
		"YCoord" : ArrayJsonObj.top
		//"BelongSegment" :
		//"OnSeg" :
		//"Type" :

	}
	}else if (this.type == 'laneEnd') {
		return {
		"Member" : ArrayJsonObj.member,
		"Left" : ArrayJsonObj.left,
		"Top" : ArrayJsonObj.top
	}
	}
	else if (this.type == 'laneAdd') {
		return {
		"Member" : ArrayJsonObj.member,
		"Left" : ArrayJsonObj.left,
		"Top" : ArrayJsonObj.top
	}
	}
	else if (this.type == 'offRamp') {
		return {
		"Member" : ArrayJsonObj.member,
		"Left" : ArrayJsonObj.left,
		"Top" : ArrayJsonObj.top
		}
	}else {
		return {
		"Member" : ArrayJsonObj.member,
		"Left" : ArrayJsonObj.left,
		"Top" : ArrayJsonObj.top
	}
	}


}
