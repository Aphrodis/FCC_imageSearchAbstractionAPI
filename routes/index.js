var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
//commented for production
//require('dotenv').config();
var Bing = require('node-bing-api')({accKey: process.env.BING_KEY, rootUri:"https://api.datamarket.azure.com/Bing/Search/v1/"});

//connect to the database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST);
mongoose.set('debug', true);

//create a schema
var historySchema = new mongoose.Schema({
    term: String,
    when: Date
});

//create model for our Schema
var History = mongoose.model('History', historySchema);

//function to parse wanted elements from Bing response
function getJson(body){
  return {
    imageUrl: body.MediaUrl,
    Title: body.Title,
    pageUrl: body.SourceUrl
  };
}

//serve landing page with updated host URL
function serveLandingPage(req, res) {
    var location = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.render('index.ejs', {
        location: location
    });
} //end serveLandingPage

//get home page
router.get('/', serveLandingPage);

//get history - return last 10 search queries
router.get('/api/history', function(req, res) {
      History.find().sort({'when': -1}).limit(10).exec(function(err, posts){
        res.json(posts);
      });
});

//get query return 10 results
router.get('/api/:id', function(req, res) {

    //handle offset param
    var qOffset = 0;
    if(req.query.offset){
      qOffset += req.query.offset*10;
    }
    console.log(qOffset);

    //get raw query input
    var input = req.params.id;

    //replace all '+' with spaces
    var query = input.split('+').join(' ');

    //run query using Bing engine
    //add current query terms to history
    Bing.images(query, {top: 10, skip: qOffset}, function(err, result, body) {
      if (err) throw err;
        var newHistory = new History({
            term: query,
            when: Date.now()
        });
        newHistory.save(function(error, data) {
            if (error) throw error;
        });

        //send parsed results
        res.send(body.d.results.map(getJson));
    });
});

//return home page for all other cases
router.get('/*', serveLandingPage);

module.exports = router;
