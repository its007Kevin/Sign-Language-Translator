var ws;
var paused = false;
var pauseOnGesture = false;
var focusListener;
var blurListener;

// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
  WebSocket = MozWebSocket;
}

// Create the socket with event handlers
function init() {
  // Create and open the socket
  ws = new WebSocket("ws://localhost:6437/v6.json");//use latest

  // On successful connection
  ws.onopen = function(event) {
    var enableMessage = JSON.stringify({enableGestures: true});
    ws.send(enableMessage); // Enable gestures
    ws.send(JSON.stringify({focused: true})); // claim focus
    
    focusListener = window.addEventListener('focus', function(e) {
        ws.send(JSON.stringify({focused: true})); // claim focus
     });

    blurListener = window.addEventListener('blur', function(e) {
         ws.send(JSON.stringify({focused: false})); // relinquish focus
     });
     
    document.getElementById("main").style.visibility = "visible";
    document.getElementById("connection").innerHTML = "WebSocket connection open!";
  };

  // On message received
  ws.onmessage = function(event) {
    if (!paused) {
      var obj = JSON.parse(event.data);
      var str = JSON.stringify(obj, undefined, 2);
      if(!obj.id){
          document.getElementById("eventoutput").innerHTML = '<pre>' + str + '</pre>';
          console.log(str);
      } else {
          document.getElementById("frameoutput").innerHTML = '<pre>' + str + '</pre>';
      }
      if (pauseOnGesture && obj.gestures.length > 0) {
				obj["GlobalParameters"] = {
					"Database server name": "gesturestraining.database.windows.net"
				}
				console.log(parse(obj));

				// let req = require("request");

				const uri = "https://ussouthcentral.services.azureml.net/workspaces/1525c34bf7ef4e7f87756b0615129f13/services/00af33dc06fc46d98a7dc09ab23f7aac/execute?api-version=2.0&details=true";
				const apiKey = "rdZwjFNOlvAa5obV6uwzEeDVs0NM2KSZAnB/VjQVjwPWwG6xC1rUdxEHsZ+Ml/7nLhPGtFYvnN93s2Z80Nf1Eg==";

				// let data = parse(obj);

				// const options = {
				//     uri: uri,
				//     method: "POST",
				//     headers: {
				//         "Content-Type": "application/json",
				//         "Authorization": "Bearer " + apiKey,
				//     },
				//     body: JSON.stringify(data)
				// }

				// req(options, (err, res, body) => {
				//     if (!err && res.statusCode == 200) {
				//         console.log(body);
				//     } else {
				//         console.log("The request failed with status code: " + res.statusCode);
				//     }
				// });

        let hardCode = {
          "Inputs": {
            "input1": {
              "ColumnNames": [
                "finger1",
                "finger2",
                "finger3",
                "finger4",
                "finger5",
                "label"
              ],
              "Values": [
                [
                  "1",
                  "1",
                  "1",
                  "1",
                  "1",
                  "value"
                ],
                [
                  "1",
                  "1",
                  "1",
                  "1",
                  "1",
                  "value"
                ]
              ]
            }
          },
          "GlobalParameters": {
             "Database server name": "gesturestraining.database.windows.net"
          }
        };


		    var ajaxData = parse(obj);
			  var serviceUrl = "https://ussouthcentral.services.azureml.net/workspaces/1525c34bf7ef4e7f87756b0615129f13/services/00af33dc06fc46d98a7dc09ab23f7aac/execute?api-version=2.0&details=true";

			  $.ajax({
			      type: "POST",
			      url: "http://localhost:5000/data",
			      data: JSON.stringify(hardCode),
            // dataType: 'json',
            contentType: 'application/json'
			  }).done(function (data) {
			      console.log(JSON.parse(data));
            $.ajax({
              type: "POST",
              url: "http://localhost:5000/speech",
              //data: {"text": "hello world"}, 
              data: JSON.stringify({"text": "hello"}),
              contentType: 'application/json'
            }).done(function (data) {
              console.log("Done");
            });
			  });
				togglePause();
			}
    }
  };

  // On socket close
  ws.onclose = function(event) {
    ws = null;
    window.removeListener("focus", focusListener);
    window.removeListener("blur", blurListener);
    document.getElementById("main").style.visibility = "hidden";
    document.getElementById("connection").innerHTML = "WebSocket connection closed";
  }

  // On socket error
  ws.onerror = function(event) {
    alert("Received error");
  };
}

function togglePause() {
  paused = !paused;

  if (paused) {
    document.getElementById("pause").innerText = "Resume";
    ws.send(JSON.stringify({focused: false})); // relinquish focus
  } else {
    document.getElementById("pause").innerText = "Pause";
    ws.send(JSON.stringify({focused: true})); // request focus
  }
}

function pauseForGestures() {
  if (document.getElementById("pauseOnGesture").checked) {
    pauseOnGesture = true;
  } else {
    pauseOnGesture = false;
  }
}

function parse(object) {
	['devices', 'interactionBox', 'timestamp', 'gestures', 'pointables', 'currentFrameR'].forEach(function (key) {
		delete object[key];
	});
	return object;
}