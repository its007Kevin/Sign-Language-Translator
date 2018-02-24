const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var cors = require('cors')
var bodyParser = require('body-parser')

let request = require("request");

const app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(cors())

app.post('/data', (req,res)=>{

	const uri = "https://ussouthcentral.services.azureml.net/workspaces/1525c34bf7ef4e7f87756b0615129f13/services/00af33dc06fc46d98a7dc09ab23f7aac/execute?api-version=2.0&details=true";
	const apiKey = "rdZwjFNOlvAa5obV6uwzEeDVs0NM2KSZAnB/VjQVjwPWwG6xC1rUdxEHsZ+Ml/7nLhPGtFYvnN93s2Z80Nf1Eg==";
	console.log(req.body)
	const options = {
	    uri: uri,
	    method: "POST",
	    headers: {
	        "Content-Type": "application/json",
	        "Authorization": "Bearer " + apiKey,
	    },
	    body: JSON.stringify(req.body)
	}

	request(options, (err, response, body) => {
    if (!err && response.statusCode == 200) {
        console.log(body);
      	res.send(body);
    } else {
    		console.log(err)
        console.log("The request failed with status code: " + response.statusCode);
    }
	});
});

  // .set('views', path.join(__dirname, 'public'))
  // .get('/', (req, res) => res.rr('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
