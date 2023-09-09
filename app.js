const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const MAILCHIMP_API_Key = "4029b46e6e3a5ff711b3bd5aa3c7bdf6-us11";
const MAILCHIMP_LIST_ID = "be264a0b5d";

const app = express();
const urlEncodedParser = bodyParser.urlencoded({ extended: true });
app.use(urlEncodedParser);
// add the line below in order for our server to serve up
// static files locally such as CSS and images
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/signup.html");
});
app.get("/success", (req, res) => {
	res.sendFile(__dirname + "/success.html");
});
app.get("/failure", (req, res) => {
	res.sendFile(__dirname + "/failure.html");
});

app.post("/failure", (req, res) => {
	return res.redirect("/");
});
// MailChimp Integration
//  [1] A POST request from a form element carrying the user input and is done in the right route
app.post("/", (req, res) => {
	const { fName: firstName, lName: lastName, email } = req.body;
	console.log(firstName, lastName, email);
	// [2] Strutcure the received data in the required form for the API
	const data = {
		members: [
			{
				email_address: email,
				email_type: "text",
				status: "unsubscribed",
				merge_fields: {
					FNAME: firstName,
					LNAME: lastName,
					BIRTHDAY: "01/22",
					ADDRESS: {
						addr1: "123 Freddie Ave",
						city: "Atlanta",
						state: "GA",
						zip: "12345",
					},
				},
			},
		],
	};
	// [3] Transform the data to json so that our server can transfer data with MailChimp server (servers communication requirement)
	const jsonData = JSON.stringify(data);
	// [4] Prepare the required info for the communication between the two servers
	//  [a] The Url to which we will send our http request (endpoint + paths)
	const url = `https://us11.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}`;
	//  [b] Configure the http request type (POST vs GET) and auth issues
	const options = {
		method: "POST",
		auth: `mohamed:${MAILCHIMP_API_Key}`,
	};
	// This is how to https post data in Node JS without third party module
	// reference ->
	// https://stackoverflow.com/questions/40537749/how-do-i-make-a-https-post-in-node-js-without-any-third-party-module
	// [5] Send our http POST request to MailChimp server carrying all the info needed for a valid request
	//  - Here my request has 3 parts
	//   [a] Make the request itself and start connection
	const request = https.request(url, options, (response) => {
		response.on("data", (data) => {
			console.log(JSON.parse(data));
			if (response.statusCode === 200) {
				console.log("Ok");
				return res.redirect("/success");
			} else {
				console.log("Something Wrong");
				return res.redirect("/failure");
			}
		});
	});
	//   [b] Send chunks of the body (my JSON data)
	request.write(jsonData);
	//   [c] Finish sending the request
	request.end();
});

app.listen(3000, () => {
	console.log("The server is running on port 3000");
});
