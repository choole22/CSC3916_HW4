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
var Actor = require('./Actors');

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
    Movie.find({}, function (err, movies) {
        if(err) {res.send(err);}
        res.json({Movie: movies});
    })
});


router.post('/movies', function (req, res) {
    var movie = new Movie();
    movie.Title = req.body.title;
    movie.Genre = req.body.genre;
    movie.Year = req.body.year;
    movie.Actors[0] = new Actor();
    movie.Actors[0].ActorName = req.body.actor1_name;
    movie.Actors[0].CharacterName = req.body.actor1_character;
    movie.Actors[1] = new Actor();
    movie.Actors[1].ActorName = req.body.actor2_name;
    movie.Actors[1].CharacterName = req.body.actor2_character;
    movie.Actors[2] = new Actor();
    movie.Actors[2].ActorName = req.body.actor3_name;
    movie.Actors[2].CharacterName = req.body.actor3_character;

    if(movie.Actors[0].ActorName.length < 1 || movie.Actors[1].ActorName.length < 1 || movie.Actors[2].ActorName.length < 1 || 
       movie.Actors[0].CharacterName.length < 1 || movie.Actors[1].CharacterName.length < 1 || movie.Actors[2].CharacterName.length < 1 ||
       movie.Title.length < 1 || movie.Genre.length < 1 || movie.Year.length < 1)
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
            Movie.findOneAndDelete({Title: req.body.title}, function (err, movies){
                if(err) {res.send(err);}
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


