var sending;

$(function () {
	$('#calcBtn').click(function (){
		$(document).ready(function (){
			var xhttp = new XMLHttpRequest ();
			xhttp.onreadystatechange = function (){
				if (xhttp.readyState === 4){
					// do your staf here
					
					
					//check sending
					alert (xhttp.response);
					xhttp.getAllResponseHeaders ();
				}
			}
			var url = 'http://ec2-52-63-190-123.ap-southeast-2.compute.amazonaws.com/';
			xhttp.open('POST',url, true);
			xhr.send ();
		});
	});
});