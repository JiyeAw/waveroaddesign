
//condtion format is "expression, expression, expression;" and defines what second road pieces the test will be applied to for each road piece
//test is a boolean expression that can include any road parameters on either road piece
//conditons, test and message should be split by ';'
//example code string: "condition1, conditon2, conditon3; test; error message"
function CreateTestObj(code) {
	var splitCode = code.split(';');
	var condtionCode = splitCode[0];
	var testCode = splitCode[1];
	var message = splitCode[2];
    //used to store parsable terms and their meanings, needs to be manualy updated when new potential piece parameters are added
    var tokenDict = {
        Operators: "+-*/^%!=&|><()", //if a symbol is in this string it is parsed in the same form

        //list all possible names for road piece parameters and what they should be parsed as here
        currentspeed: "thisPiece.speedLimit",
		otherspeed: "otherPiece.speedLimit",
        curvature: "thisPiece.curvature",
		othercurvature: "otherPiece.curvature",
		numlanes: "thisPiece.nlanes",
		othernumlanes: "otherPiece.nlanes",
		taperlength: "thisPiece.taperLength",
		othertaperlength: "otherPiece.taperLength",
		superelevation: "thisPiece.superelevation",
		otherSuperelevation: "otherPiece.superelevation",
		friction: "thisPiece.friction",
		otherfriction: "otherPiece.friction",
		type: "thisPiece.type",
		othertype: "otherPiece.type",
		
		//feature types
		segment: "'segment'",
		speed:"'speed'",
		merge:"'laneEnd'",
		diverge:"'laneAdd'",
		offramp:"'offRamp'",
		onramp: "'onramp'",
		
		
		//list of possible names for calculatable parameters, the functions must be defined in newFunsObject()
		distancefromcenter: "funs.distanceFromCenters(thisPiece, otherPiece)",
		distance: "funs.distanceFromEdges(thisPiece, otherPiece)",
		distancefoward: "funs.distanceFoward(thisPiece, otherPiece)",
		distanceback: "funs.distanceBack(thisPiece, otherPiece)"
	};
	//constructor for object that stores functions used in tests
	function newFunsObject(){
		function distanceFromCenters(thisPiece, otherPiece){
			var otherCenter = (otherPiece.loc+(otherPiece.len/2));
			var thisCenter = (thisPiece.loc+(thisPiece.len/2));
			return Math.abs(otherCenter - thisCenter);
		}
		function distanceFromEdges(thisPiece, otherPiece){
			var start2start = Math.abs(otherPiece.loc - thisPiece.loc);
			var	end2start = Math.abs(otherPiece.loc - (thisPiece.loc+thisPiece.len));
			var start2end = Math.abs((otherPiece.loc+otherPiece.len) - thisPiece.loc);
			var end2end = Math.abs((otherPiece.loc+otherPiece.len) - (thisPiece.loc+thisPiece.len));
			return Math.min(start2start, start2end, end2start, end2end);
	
		}
		function distanceFoward(thisPiece, otherPiece){
			var end2start = otherPiece.loc - (thisPiece.loc + thisPiece.len);
			return end2start;
		}
		function distanceBack(thisPiece, otherPiece){
			var start2end = Math.abs((otherPiece.loc+otherPiece.len) - thisPiece.loc);
			return start2end;
		}
	return {
		distanceFromCenters: distanceFromCenters,
		distanceFromEdges: distanceFromEdges,
		distanceFoward: distanceFoward, 
		distanceBack: distanceBack
	}
	}
    
	//verify the code is actually code
    //if (typeof condtionCode !== "string" || typeof testCode !== "string") throw Error("parameters must be strings");
    //parse the test
    var testObj = parseTestString(condtionCode, testCode);

    //returns the applyTest method
    return { applyTest: applyTest };

    //function used to apply the test stored in the object to a road
    //returns a list of issues: {segmentId, location(segment), message}
    function applyTest(road) {
        //initialise the array of issues
        var issues = [];
        //for each piece
        for (var i = 0; i < road.length; i++) {
            //if the piece fails the test
            if (applyTestToPiece(road, road[i], newFunsObject(), testObj.expression, testObj.conditons)) {
				//create an issue and add it to the array
                issues.push({segID: road[i].seg, location: locationCurried(road[i].POnSeg) , message: message});
            }
        }
		
		//return the array of issues
        return issues;
		
		//Higher order function used to create issue.location()
		//given number P from 0-1000 returns a function 
		//that takes a segment and returns the coordinates P/1000 along the segment
		function locationCurried(P){
			return function(segment){
				var x1 = segment.startX;
				var y1 = segment.startY;
				var x2 = segment.endX;
				var y2 = segment.endY;
			
				return {
					x: x1+((P/1000)*(x2-x1)), 
					y: y1+((P/1000)*(y2-y1))
				};
			}
		}

        //applys the test to a single road piece
        function applyTestToPiece(road, piece, funsObj, testFun, condtions) {
			
			var hasFailed = false;
			for (var i = 0; i < road.length; i++){
				var expressionsTrue = true;
                for (var j = 0; j < condtions.length; j++) {
                    expressionsTrue = expressionsTrue && condtions[j](piece, road[i], funsObj);
                }
				if (expressionsTrue){
					//apply the test function to the pieces
					hasFailed = hasFailed || testFun(piece, road[i], funsObj);
				}
			}
			return hasFailed;
        }
    }
	
    //function to parse the code into js functions
    function parseTestString(conditionCode, testCode) {

        //parse conditons
        if (conditionCode !== "") {
            var conditonsStringArray = conditionCode.split(",");
            var conditons = [];
            for (i = 0; i < conditonsStringArray.length; i++) {
                var newConditon = parseExpression(expressionStream(charStream(conditonsStringArray[i])));
                conditons.push(newConditon);
            }
        }
		
		//parse test
		var testExpression = parseExpression(expressionStream(charStream(testCode)));
		
        return {conditons: conditons, expression: testExpression };

        function expressionStream(charStream) {

            var current = null;

            return {
                next: next,
                peek: peek,
                endof: endof,
                throwErr: throwErr
            };


            //Primary function of tokenStream, used in peek() and next() to assemble the next token from charStream
            function readNext() {

                if (charStream.endof()) return null;
                var char = charStream.peek();
                readWhile(isWhitespace);
                char = charStream.peek();
                if (char === '#') {
                    skipComment();
                    return readNext();
                }
                if (isDigit(char)) return readNumber();
                if (isLetter(char)) return readWord();
                if (isOperator(char)) {return readOperator();}
                charStream.throwErr("Unable to read: " + char);
            }

            //methods
            function peek() {
                return current || (current = readNext());
            }
            function next() {
                var token = current;
                current = null;
                return token || readNext();
            }
            function endof() {
                return peek() === null;
            }

            //Utilities
            function isLetter(char) {
                return /[a-z]/i.test(char);
            }
            function isDigit(char) {
                return /[0-9]/i.test(char);
            }
            function isOperator(char) {
                return tokenDict.Operators.indexOf(char) >= 0;
            }
            function isWhitespace(char) {
                return " \t\n".indexOf(char) >= 0;
            }
            function skipComment() {
                charStream.next();
                readWhile(function (char) { return char !== "#"; });//return true;});
                charStream.next();
            }

            //token generating functions. these functions are called by readNext when it has identified what is about to be read
            //they read through charStream until they reach the end of the thing they are designed to read and return it.

            //attempts to read a number
            function readNumber() {
                var isDecimal = false; //stores if a period has been found

                var number = readWhile(function (char) {//read while function returns true
                    if (char === ".") {//if the next char is a period
                        if (isDecimal) return false;//and a period has already been found return false
                        isDecimal = true;//else set isDecimal to true
                        return true;//and return true
                    }
                    return isDigit(char);//return whether next char is digit
                });//end read while
                return number;//return token type num with read value
            }

            //attempts to read a word
            function readWord() {
                //read until a char other than a letter, number, underscore or period is found
                var word = readWhile(function (char) { return isLetter(char) || isDigit(char) || char === '_' || char === '.'; });

                //return the meaning of the word if it is in the dictonary otherwise throw an error
                if (tokenDict[word] === null) charStream.throwErr("unknown input '" + word + "'");
                return tokenDict[word];
            }

            //reads an operator symbol
            function readOperator() {
				var operator = readWhile(function (char) { return isOperator(char); });
                return operator;
            }

            //takes a function and then reads through charStream until the function returns false then returns the string of characters it read.
            function readWhile(predicate) {
                var string = "";
                while (!charStream.endof() && predicate(charStream.peek())) {
                    string += charStream.next();
                }
                return string;
            }

            //custom errors
            //throw when test code ends unexpectedly
            function endError() {
                charStream.throwErr("Unexpected end of code");
            }

            //throw when unexpected punction is found
            function puncError(punc, section) {
                charStream.throwErr("'" + punc + "' used in incorrect section");
            }

            function throwErr(msg) {
                charStream.throwErr(msg);
            }

        }

		function charStream(input) {
            var pos = 0, line = 1, col = 0;
            var code = input.toLowerCase();
            return {
                next: next,
                peek: peek,
                endof: endof,
                throwErr: throwErr
            };
            function next() {
                var char = code.charAt(pos++);
                if (char === "\n") line++ , col = 0; else col++;
                return char;
            }
            function peek() {
                return code.charAt(pos);
            }
            function endof() {
                return peek() === "";
            }
            function throwErr(msg) {
                console.log(msg + " (" + line + ":" + col + ")");
                throw new Error(msg + " (" + line + ":" + col + ")");
            }
        }
    
		//converts an expression stream into a js function
		function parseExpression(expressionStream){
			//function body
			var expressionString = "return";
			
			//while there is code in the expression stream
			while (!expressionStream.endof()) {
				//add the next token to the function body
				expressionString += " " + expressionStream.next();
			}
			//finish the function body
			expressionString += ';';
			
			//if expressionString is "retrun null;" then the expression should actually always return true
			if (expressionString === "return null;"){expressionString = "return true;"}
			return new Function('thisPiece', 'otherPiece', 'funs', expressionString);
		}
	}
}

//function to sort the features of a road into seperate arrays based on their segment
//also orders the features by their position on the segment
function SortRoad(frontEndRoad){
	var segments = frontEndRoad.segments;
	var nodes = frontEndRoad.nodes;
	var features = frontEndRoad.features;
	
	var featuresBySegment = {};
	
	//for each segment
	for (var i = 0; i < segments.length; i++){
		var featuresByLocation = {};
		var featuresOnSegment = [];
		//for each feature
		for (var j=0; j < features.length; j++){
			//if the feature is on the segment
			if (segments[i].id == features[j].onSeg.id){
				//project the feature onto the segment
				var positionOnSegment = findPositionOnSegment(segments[i], features[j]);
				//add it to an object with id = position on segment
				featuresByLocation[positionOnSegment] = features[j];
			}
		}
		
		//for each possible index in featuresByLocation (the positions are rounded down to the nearest 0.1 of a percentile)
		for(j = 0; j < 1000; j++){
			//if there is a feature at that index
			if(featuresByLocation.hasOwnProperty(j)){
				//add it to the array of features in the segment
				featuresOnSegment.push(featuresByLocation[j]);
			}
		}
		
		//add the list of features on this segment to the set of features sorted by segment
		featuresBySegment[segments[i].id] = featuresOnSegment;
	}
	return {segments: segments, nodes: nodes, features: featuresBySegment};
}

//finds the percentage distance along the segment that the feature is located at. Assumes segment is strait
function findPositionOnSegment(segment, feature){
		//vector from segment start to point
		var AtoP = [feature.xCoord - segment.startX, feature.yCoord - segment.startY];
		//segment as a vector
		var AtoB = [segment.endX - segment.startX, segment.endY - segment.startY]
		//magnitude of AtoB
		var magnitudeAtoB = AtoB[0] * AtoB[0] + AtoB[1] * AtoB[1];
		//dot product of the two vectors
		var AtoPDotAtoB =  AtoB[0] * AtoP[0] + AtoB[1] * AtoP[1];
		//normalising AtoPDotAtoB
		var t = AtoPDotAtoB / magnitudeAtoB;
		
		//return the 0.1 of a percentage distance along the segment rounded down (0 = start of segment, 1000 = end of segment)
		return Math.floor(t*1000);
	}	

//converts a sorted road (from SortRoad) into an array of pieces that can be tested with RunTests
function ConvertRoadForTesting(sortedRoad){
	var road = [];
	var segments = sortedRoad.segments;
	var nodes = sortedRoad.nodes;
	var features = sortedRoad.features;
	var currentPiece = 1;//iterator to remember the current index on the array being assembled
	
	//Create initial piece, piece constructor can not handle this special case
	//For general comments on piece object see newPiece()
	//TODO: modify to read initial conditions object once it is implemented in the frontend
	road.push({
		POnSeg: 0,
		seg: segments[0].id,
		startPosOnSeg: 0,
		len: parseInt(segments[0].abstractLength),//this will be changed if the first segment has any features
		speedLimit: 70,
		curvature: segments[0].gradient, 
		nLanes: 3,
		taperLength: 0,
		friction: 0.9,
		superelevation: segments[0].superElevation
	});
	//for each segment
	for (var i = 0; i < segments.length; i++){
		
		//if this is not the first segment
		if (i != 0){
			//create a new piece and add it to the road
			//(features[segments[i].id].length <= 0) is false when the segment has features
			road.push(newPiece(segments[i], null, road[currentPiece-1], features[segments[i].id].length <= 0));
			currentPiece++;
		}
		
		//for each feature on the segment create a new piece
		for (var j = 0; j < features[segments[i].id].length; j++){
			//(j == features[segments[i].id].length - 1) will be true if this is the last feature on this segment
			road.push(newPiece(segments[i], features[segments[i].id][j], road[currentPiece-1], (j == features[segments[i].id].length - 1)));
			currentPiece++;
		}
	}
	//calculating the length of each piece but the last
	for (i = 0; i < road.length-1; i++){
		//get the start of the next piece (i.e. end of this piece)
		var endPos = road[i+1].startPosOnSeg;
		//if the next piece is not the first one of the segment
		if(endPos != 0){
			//get the start of the piece
			var startPos = road[i].startPosOnSeg;
			//get the difference (i.e. the length of this piece)
			road[i].len = endPos-startPos;
		}
		
		//if it was the first piece of a segment then the length will already be set
	}
	//calculate the last piece
	var startPos = road[road.length-1].startPosOnSeg;
	var endPos = segments[segments.length-1].abstractLength;
	road[road.length-1].len = endPos-startPos;
	
	//the location of each piece is the sum of the pieces before it
	for(i = 0; i < road.length; i++){
		var loc = 0;
		for (var j = 0; j < i; j++){
			loc += road[j].len;
		}
		road[i].loc = loc;
	}
	
	////////////////////////
	//end of function body//
	////////////////////////
	return road;
	
	
	//helper function to add new piece, this function needs to be edited when new variables are added to the front end
	function newPiece(segment, feature, previousPiece, isLastPiece){
		//initial conditions of the piece
		var piece = {
			//the relative position (from 0-1000) of the start of the piece and the id of the segment this is a piece of, used for error reporting
			POnSeg: 0,//assume first piece on segment (i.e. no feature) until told otherwise
			seg: segment.id,
			
			
			//the geographical distance along the segment that the piece is located at
			startPosOnSeg: 0,//assume first piece on segment until told otherwise
			
			//variables used in tests. all pieces have all variables, features determine which ones differ from the previous piece
			len: 0,//length is calculated after all pieces are created. This is because the piece's end is unknown until the next piece is created.
			loc: 0,//loc is calculated with lengths
			speedLimit: previousPiece.speedLimit,
			curvature: segment.gradient, 
			nLanes: previousPiece.nLanes,
			taperLength: 0,//is only not 0 if the feature is a merge
			friction: 0.9,//friction of bitumen road
			superelevation: segment.superElevation,
			type: 'segment'//type of feature that starts the piece
		};
		//since the end of the piece is the end of the segment we can subtract startPosOnSeg from the total length
		piece.len = parseInt(segment.abstractLength) - piece.startPosOnSeg;
		//if the piece is being created with a feature
		if(feature != null){
			piece.POnSeg = findPositionOnSegment(segment, feature);
			piece.startPosOnSeg = segment.abstractLength * (findPositionOnSegment(segment, feature)/1000);
			
			piece.type = feature.type;

			//determine and apply changes
			if(feature.type === 'speed'){ piece.speedLimit = parseInt(feature.speed);	}

			if(feature.type === 'laneEnd'){ piece.nLanes = piece.nLanes - parseInt(feature.numberOfLanes); piece.taperLength = feature.taperLength; }
		
			if(feature.type ==='laneAdd'){ piece.nLanes = piece.nLanes + parseInt(feature.numberOfLanes); }
		
			if(feature.type === 'offRamp' && feature.lane == false){ piece.nLanes = piece.nLanes - 1; }
		}
		return piece;
	}
}
/* old function used to load a tests file in nodejs
//loads a file specified by fileName and returns an array of test objects specified by code in the file
function LoadTests(fileName){
	var tests = [];
	var testsCodeArray = [];
	//read the specified file
	fs.readFile(fileName, "utf8", function(err, data) {
		var testString = removeComments(data);
		//split the file on each '@'
		testsCodeArray = testString.split("@");
	});
	
	for (var i = 0; i < testsCodeArray.length; i++){
		tests.push(CreateTestObj(testsCodeArray[i]));
	}
	return tests;	
}
*/

//removes the comments (characters between two #) from a string
function removeComments(code){

	var codeStream = charStream(code);
	var cleanedCode = "";
	
	while(!codeStream.endof()){
		var char = codeStream.peek();
		if (char === '#') {
			skipComment();
		}
		cleanedCode += codeStream.next();
	}
	return cleanedCode;
	

	function skipComment() {
		codeStream.next();
		readWhile(function (char) { return char !== "#"; });//return true;});
		codeStream.next();
		
		function readWhile(predicate) {
			var string = "";
			while (!codeStream.endof() && predicate(codeStream.peek())) {
				string += codeStream.next();
			}
			return string;
		}
	}
	function charStream(input) {
        var pos = 0, line = 1, col = 0;
        var code = input.toLowerCase();
        return {
            next: next,
            peek: peek,
            endof: endof,
            throwErr: throwErr
        };
        function next() {
            var char = code.charAt(pos++);
            if (char === "\n") line++ , col = 0; else col++;
            return char;
        }
        function peek() {
            return code.charAt(pos);
        }
        function endof() {
            return peek() === "";
        }
        function throwErr(msg) {
            console.log(msg + " (" + line + ":" + col + ")");
            throw new Error(msg + " (" + line + ":" + col + ")");
        }
    }
}

//takes a road and an array of test objects, runs the tests on the road and returns an array of issue objects
function RunTests(frontEndRoad, tests){
	var sortedRoad = SortRoad(frontEndRoad);
	var backEndRoad = ConvertRoadForTesting(sortedRoad);
	var issues = [];
	for (var i = 0; i < tests.length; i++){
		issues = issues.concat(tests[i].applyTest(backEndRoad));
	}
	return issues;
}

//returns an array of fabric objects that represent the error messages
function drawIssues(segmentArr, issues){
	var texts = [];
	for (var i = 0; i < issues.length; i++){
		texts.push(createFabricIssue(segmentArr, issues[i]));
	}
	
	var overlaps = {};
	//for each text of texts
	for (i = 0; i < texts.length; i++){
		//if it overlaps with another text
		for (var j = 0; j < texts.length; j++){
			//if they overlap
			if(texts[i].left == texts[j].left && texts[i].top == texts[j].top){
				
				//if the canvas location hsa not been added to the array of overlaps add it
				//regardless, add the two indicies to the list of overlaps at that location
				if(overlaps.hasOwnProperty([texts[i].top])){
					if(overlaps[texts[i].top].hasOwnProperty([texts[i].left])){
						overlaps[texts[i].top][texts[i].left].push(i);
						overlaps[texts[i].top][texts[i].left].push(j);
					}
					else{
						overlaps[texts[i].top] = {};
						overlaps[texts[i].top][texts[i].left] = [];
						overlaps[texts[i].top][texts[i].left].push(i);
						overlaps[texts[i].top][texts[i].left].push(j);
					}
				}
				else{
						overlaps[texts[i].top] = {};
						overlaps[texts[i].top][texts[i].left] = [];
						overlaps[texts[i].top][texts[i].left].push(i);
						overlaps[texts[i].top][texts[i].left].push(j);
				}
			}
		}
	}
	
	for (const x of Object.keys(overlaps)) {
		for (const y of Object.keys(overlaps[x])){
			function filterUnique(value, index, self) { 
				return self.indexOf(value) === index;
			}
			var indicies = overlaps[x][y].filter(filterUnique);
			for (var i = 0; i < indicies.length; i++){
				texts[indicies[i]].top += i * 15;
			}
		}		
	}
	return texts;
}

//creates a fabric js text version of the given issue
function createFabricIssue(segmentArr, issue){

	var segment;//holds segment
	var done = false;//exit search early when true
	for (var i = 0; i < segmentArr.length && !done; i++){
		if (segmentArr[i].id == issue.segID){
			done = true;
			segment = segmentArr[i];
		}
	}
	if(!done){ return text = new fabric.Text('could not find segment for: ' + issue.message, {left: 30, top: 30, fontSize: 12});}
	var loc = issue.location(segment);
	var left = loc.x;
	var top = loc.y;

	return text = new fabric.Text(issue.message, {
		left: Math.floor(left+5), top: Math.floor(top-30), angle: -30,
		fontSize: 12, fontFamily: 'helvetica',
		stroke: '#288db7',
	});
}

//compiles the front end datastructure into a single object
function compileRoad(){
	return {
		nodes: nodeArray,
		segments: segArray,
		features: speedArray.concat(laneEndArray, laneAddArray, onRampArray, offRampArray)
	};
}

//reads the tests from a string
function ReadTests(testsString){
		var tests = [];
		var testsString = removeComments(testsString);
		var testsCodeArray = testsString.split("@");
		for (var i = 0; i < testsCodeArray.length; i++){
			tests.push(CreateTestObj(testsCodeArray[i]));
		}
		return tests;
	}

	document.getElementById('reportBtn').onclick = function(){

	console.log("Starting tests");

	var tests = ReadTests(testString);
	var frontEndRoad = compileRoad();
	var issues = RunTests(frontEndRoad, tests);
	var texts = drawIssues(segArray, issues);
	for (var i = 0; i < texts.length; i++){
		canvas.add(texts[i]); //print them to the canvas
	}
	console.log("Finished tests");
}