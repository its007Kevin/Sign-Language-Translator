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

    //document.getElementById("main").style.visibility = "visible";
    //document.getElementById("connection").innerHTML = "WebSocket connection open!";
  };

  // On message received
  ws.onmessage = function(event) {
    if (!paused) {
      var obj = JSON.parse(event.data);
      var str = JSON.stringify(obj, undefined, 2);
      if(!obj.id){
          //document.getElementById("eventoutput").innerHTML = '<pre>' + str + '</pre>';
      } else {
          //document.getElementById("frameoutput").innerHTML = '<pre>' + str + '</pre>';
      }
      if (pauseOnGesture && obj.gestures.length > 0) {
				obj["pointables"][0]["GlobalParameters"] = {
					"Database server name": "gesturestraining.database.windows.net"
				}

        obj["pointables"][0]["Answer"] = "Love";

				const uri = "https://ussouthcentral.services.azureml.net/workspaces/1525c34bf7ef4e7f87756b0615129f13/services/df80f7d9955d43a19b46e14ddf58c5d0/execute?api-version=2.0&details=true";
				const apiKey = "NdcZrWX6QHjm2OuO3ENQE4mSzZ4vrOfHbSvo8dDoHSNUztIK6zB/30xO67YP9gtMyOEKgfKGxanXb6yKSATCzA==";

        var preData = filter(obj);
        console.log(JSON.stringify(preData));
        var columnNames = [];
        for (var key in preData) {
          if (key === "d0_GlobalParameters_Database server name") {
            columnNames.push("d0_GlobalParameters_Database_server_name")
          } else {
            columnNames.push(key.toString());
          }
        }
        var values = [];
        for (var key in preData) {
          values.push(preData[key].toString());
        }


        let data = {
          "Inputs": {
            "input1": {
              "ColumnNames": columnNames,
              "Values": [ values, values ]
            }
          },
          "GlobalParameters": {
             "Database server name": "gesturestraining.database.windows.net"
          }
        };

        console.log(JSON.stringify(data));

			  var serviceUrl = "https://ussouthcentral.services.azureml.net/workspaces/1525c34bf7ef4e7f87756b0615129f13/services/df80f7d9955d43a19b46e14ddf58c5d0/execute?api-version=2.0&details=true";
  		  $.ajax({
            type: "POST",
            url: "http://localhost:5000/data",
            data: JSON.stringify(data),
            contentType: 'application/json'
        }).done(function (data) {
            var result = JSON.parse(data);
            console.log(result);
            var word = result.Results.output1.value.Values[1][result.Results.output1.value.Values[1].length - 1];
            if (word === $('#label').html()) {
              // $.ajax({
              //   type: "POST",
              //   url: "http://localhost:5000/speech",
              //   //data: {"text": "hello world"},
              //   data: JSON.stringify({"text": "Correct!"}),
              //   contentType: 'application/json'
              // }).done(function (data) {
              //   console.log("Done");
              // });
              $('#message').html("That's Correct!");
              setTimeout(function () {
                  $('#message').html("");
              }, 3000);
            } else {
              // $.ajax({
              //   type: "POST",
              //   url: "http://localhost:5000/speech",
              //   //data: {"text": "hello world"},
              //   data: JSON.stringify({"text": "Sorry, that's incorrect"}),
              //   contentType: 'application/json'
              // }).done(function (data) {
              //   console.log("Done");
              // });
              $('#message').html("Sorry, thats incorrect");
              setTimeout(function () {
                  $('#message').html("");
              }, 3000);
            }
            console.log(word);
            document.getElementById("sign").innerHTML = word;
            $.ajax({
              type: "POST",
              url: "http://localhost:5000/speech",
              //data: {"text": "hello world"},
              data: JSON.stringify({"text": word}),
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
    //document.getElementById("pause").innerText = "Resume";
    ws.send(JSON.stringify({focused: false})); // relinquish focus
    setTimeout(function () {
      console.log("Ready for next input");
        togglePause();
    }, 1500);
  } else {
    //document.getElementById("pause").innerText = "Pause";
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

function filter(json) {
  var fingers = json["pointables"];
  for (var i = 0; i < fingers.length; i++) {
    ["touchZone", "tool", "tipVelocity"].forEach (function (key) {
      delete fingers[i][key];
    });
  }
  var hands = json["hands"];
  for (var i = 0; i < hands.length; i++) {
    ["elbow", "armBasis", "armWidth", "id", "palmVelocity", "r", "s", "t", "wrist", "sphereRadius", "sphereCenter"].forEach (function (key) {
      delete hands[i][key];
    });
  }
  result = fingers.concat(hands);
  var flatten = Object.flatten(result);
  for (var key in flatten) {
    var temp = flatten[key];
    flatten["d" + key] = temp;
    delete flatten[key];
  }
  return flatten;
}

Object.flatten = function(data) {
  var result = {};
  function recurse (cur, prop) {
      if (Object(cur) !== cur) {
          result[prop] = cur;
      } else if (Array.isArray(cur)) {
           for(var i=0, l=cur.length; i<l; i++)
               recurse(cur[i], prop +  i);
          if (l == 0)
              result[prop] = [];
      } else {
          var isEmpty = true;
          for (var p in cur) {
              isEmpty = false;
              recurse(cur[p], prop ? prop+"_"+p : p);
          }
          if (isEmpty && prop)
              result[prop] = {};
      }
  }
  recurse(data, "");
  return result;
}
