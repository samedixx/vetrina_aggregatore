const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

module.exports = function(passport){
    passport.serializeUser(function (user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

    //register
    passport.use('local-register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done){
        User.findOne({'email': email}, function (err, user){
            if(err){ return done(err);}
            if(user){
                return done(null, false, req.flash('errorMessage', 'The email is already taken.'));
            } else {
                var newUser = new User();
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.username = req.body.username;
                newUser.usertype = "admin"; //admin - user
                newUser.save(function (err){
                    if (err){throw err;}
                    return done(null);
                });
            }
        });
    }));

    //login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done){
        User.findOne({'email': email}, function (err, user){
            if(err){ return done(err);}
            if(!user){
                return done(null, false, req.flash('errorMessage', 'No user found.'));
            }
            if (!user.validatePassword(password)){
                return done(null, false, req.flash('errorMessage', 'Wrong Password'));

            }
            return done(null, user);
        });
    }));
};