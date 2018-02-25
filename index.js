const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var cors = require('cors')
var bodyParser = require('body-parser')

//var request = require('request'),
var xmlbuilder = require('xmlbuilder'),
    wav = require('wav'),
    Speaker = require('speaker');

let request = require("request");

const app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(cors())

app.post('/data', (req,res)=>{

	const uri = "https://ussouthcentral.services.azureml.net/workspaces/1525c34bf7ef4e7f87756b0615129f13/services/df80f7d9955d43a19b46e14ddf58c5d0/execute?api-version=2.0&details=true";
	const apiKey = "NdcZrWX6QHjm2OuO3ENQE4mSzZ4vrOfHbSvo8dDoHSNUztIK6zB/30xO67YP9gtMyOEKgfKGxanXb6yKSATCzA==";
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
    		console.log(err);
        console.log("The request failed with status code: " + response.statusCode);
    }
	});	
});







app.post('/speech', (req,res)=>{

    var apiKey = "f81f6dad277448f283d001011b1c58a7";
    //console.log(req.body.Inputs);
    var ssml_doc = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'en-us')
        .ele('voice')
        .att('xml:lang', 'en-us')
        .att('xml:gender', 'Female')
        .att('name', 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)')
        .txt(req.body.text)
        .end();

    var post_speak_data = ssml_doc.toString();

    request.post({
    	url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key' : apiKey
        }
    }, function (err, resp, access_token) {
        if (err || resp.statusCode != 200) {
            console.log(err, resp.body);
        } else {
            try {
                request.post({
                    url: 'https://speech.platform.bing.com/synthesize',
                    body: post_speak_data,
                    headers: {
                        'content-type' : 'application/ssml+xml',
                        'X-Microsoft-OutputFormat' : 'riff-16khz-16bit-mono-pcm',
                        'Authorization': 'Bearer ' + access_token,
                        'X-Search-AppId': '07D3234E49CE426DAA29772419F436CA',
                        'X-Search-ClientID': '1ECFAE91408841A480F00935DC390960',
                        'User-Agent': 'TTSNodeJS'
                    },
                    encoding: null
                }, function (err, resp, speak_data) {
                    if (err || resp.statusCode != 200) {
                        console.log(err, resp.body);
                    } else {
                        try {
                            var reader = new wav.Reader();
                            reader.on('format', function (format) {
                                reader.pipe(new Speaker(format));
                            });
                            var Readable = require('stream').Readable;
                            var s = new Readable;
                            s.push(speak_data);
                            s.push(null);
                            s.pipe(reader);
                        } catch (e) {
                            console.log(e.message);
                        }
                    }
                });
            } catch (e) {
                console.log(e.message);
            }
        }
    });
});

  // .set('views', path.join(__dirname, 'public'))
  // .get('/', (req, res) => res.rr('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
