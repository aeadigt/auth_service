/*
var atob = require('atob');
module.exports = {
    login: function(req, res) {
	if (!req.param('token')) res.send(400, {success: false, msg: 'Token required!'});
        var enc_token = atob(req.param('token'));
        var login = enc_token.substr(0, enc_token.indexOf(":"));
        var password = enc_token.substr(enc_token.indexOf(":") + 1);
        if (!login || !password) {
            res.send(400, {success:false, msg: 'Check login/password' });
            return;
        };
        Users.findOneByLogin(login, function (err, user) {
            if (err) return res.send(500, {success:false, msg:'Internal Server Error'});
            if (!user) {
                res.send(404, {success:false, msg:'User not foud'});
                return;
            }
            if (password == atob(user.encryptedPassword)) {
                req.session.authenticated = true;
                req.session.User = user;
                res.send(200, {success:true});
            } else {
                res.send(401, {success:false, msg:'Invalid password'});
                return;
            }
        });
    },
    logout: function(req, res) {
        req.session.destroy();
        res.send(200, {success:true});
    }
};
*/



var passport = require('passport');
module.exports = {
    login: function(req, res, next) {
        passport.authenticate('local', function(error, user, info) {
            if (error) {
                next(new Error('Some error was occured'));
            } else if (!user) {
                next(info);
            } else {
                req.login(user, function(error) {
                    if (error) {
                        next(new Error(error));
                    } else {
                        res.send(200, {success: true});
                    }
                });
            }
        })(req, res); //IMPORTANT: обращаем внимание на то, что мы вызываем authenticate('login', ...)(req,res);
        //Passport'у нужно получить значени€ логина\парол€ с req.body
    },
    logout: function(req, res, next) {
        //„истим куки с нашим token'ом
        res.clearCookie('token');
        req.logout();
        res.redirect('/');
    }
};