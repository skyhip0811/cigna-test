const express = require('express');
const app = express()
const request = require('request');
const fs = require('fs')
const ejs = require('ejs')


app.get('/rus-dynamic-data',(req,res)=>{
	request('http://weather.asiaray.com/hsr7_8_data.json', function (error, response, body) {
		console.log(body);
		fs.readFile(__dirname + '/rus-dynamic-data/index.html', 'utf-8', (err, html) => {

	    	res.send(ejs.render(html, {data:JSON.parse(body)}))
	  	})

	});

});



app.use('/rus-dynamic-data', express.static('rus-dynamic-data'))

app.listen(3000, () => console.log('example app listening on port 3000!'))
