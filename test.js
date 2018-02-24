let req = require("request");

const uri = "https://ussouthcentral.services.azureml.net/workspaces/1525c34bf7ef4e7f87756b0615129f13/services/00af33dc06fc46d98a7dc09ab23f7aac/execute?api-version=2.0&details=true";
const apiKey = "rdZwjFNOlvAa5obV6uwzEeDVs0NM2KSZAnB/VjQVjwPWwG6xC1rUdxEHsZ+Ml/7nLhPGtFYvnN93s2Z80Nf1Eg==";

let data = {
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
}

const options = {
    uri: uri,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify(data)
}

req(options, (err, res, body) => {
    if (!err && res.statusCode == 200) {
        console.log(body);
    } else {
        console.log("The request failed with status code: " + res.statusCode);
    }
});