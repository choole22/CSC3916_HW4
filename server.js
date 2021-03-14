/*
CSC3916 HW3
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.get('/movies', function (req, res) {
    var getMovie = db.findOne(req.body.mTitle);;
    res.json ({status: 200, msg: 'GET movies'});
});

router.post('/movies', function (req, res) {
    var movie = new Movie();
    movie.Title = req.body.title;
    movie.Genre = req.body.genre;
    movie.Year = req.body.year;
    movie.Actors[0] = req.body.actor_1;
    movie.Actors[1] = req.body.actor_2;
    movie.Actors[2] = req.body.actor_3;
    
if(movie.Actors[0] == null || movie.Actors[1] == null || movie.Actors[2] == null || movie.Title == null || movie.Genre == null || movie.Year == null)
    {
        return res.json({Error: 'Missing attribute; could not add movie.'})
    }

    movie.save(function(err){
        if (err) {
            if (err.code == 11000)
                return res.json({ success: false, message: 'A movie with that title already exists.'});
            else
                return res.json(err);
        }

        res.json({success: true, msg: 'Successfully created new movie.'})
    });
});


router.route('/movies')
    .delete(authController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            res.json({msg: 'Movie Deleted'})

            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req);
            res.json(o);
        }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            res.json({msg: 'Movie Updated'})

                if (req.get('Content-Type')) {
                    res = res.type(req.get('Content-Type'));
                }
                var o = getJSONObjectForMovieRequirement(req);
                res.json(o);
        }
    );

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


