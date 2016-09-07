//var bcrypt = require('bcrypt'), //Подключаем bcrypt
var crypto = require('crypto'), //crypto для генерации устойчивого token'а
    passport = require('passport'), //passport
    LocalStrategy = require('passport-local').Strategy, //Локальную стратегию
    RememberMeStrategy = require('passport-remember-me').Strategy,
    atob = require('atob'); //Remember Me стратегию

//Чтобы добавить поддержку "login sessions"
//нужно задать функции serialize\deserialize.
passport.serializeUser(function(user, next) {
    next(null, user.id);
});

passport.deserializeUser(function(id, next) {
    Users
        .findOne(id,function(error, user) {
            next(error, user);
        });
});

module.exports = {
    express: {
        customMiddleware: function(app) {

            //Настроим локальную стратегию
            passport.use(new LocalStrategy({
                    usernameField: 'login',
                    passwordField: 'password'
                },
                function(username, password, next) {
                    //Ищем пользователя с введенным логином или email'ом
                    Users.findOne({
                            or: [{
                                login: username
                            }, {
                                email: username
                            }]
                        },function(error, user) {
                            //Сигнатура next-callback'а:
                            //next(error, user, info);
                            if (error) {
                                next(error);
                            } else if (!user) {
                                next(false, false, 'This user not exists');
                            } else if (password != atob(user.encryptedPassword)) {
                                next(false, false, 'Wrong password');
                            } else {
                                next(false, user);
                            }
                        });
                }
            ));

            //Настраиваем RememberMe стратегию
            passport.use(new RememberMeStrategy({
                    key: 'token' //Указываем имя cookie, где хранится ваш token
                },
                function(token, done) {
                    //Ищем пользователя с этим token'ом
                    Users
                        .findOne({
                            autoLoginHash: token
                        }, function(error, user) {
                            if (error) {
                                done(error);
                            } else if (!user) {
                                done(null, false);
                            } else {
                                //Нужно инвалидировать token в целях безопасности
                                delete user.autoLoginHash;
                                user.save(function() {});
                                done(null, user);
                            }
                        });
                }, function(user, done) {
                    //И генерируем новый token
                    var token = crypto.randomBytes(32).toString('hex');
                    user.autoLoginHash = token;
                    user.save(function() {});
                    done(null, token);
                }));

            app.use(passport.initialize());
            app.use(passport.session());
            app.use(passport.authenticate('remember-me'));
        }
    }
};