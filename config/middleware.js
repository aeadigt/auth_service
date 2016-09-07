//var bcrypt = require('bcrypt'), //���������� bcrypt
var crypto = require('crypto'), //crypto ��� ��������� ����������� token'�
    passport = require('passport'), //passport
    LocalStrategy = require('passport-local').Strategy, //��������� ���������
    RememberMeStrategy = require('passport-remember-me').Strategy,
    atob = require('atob'); //Remember Me ���������

//����� �������� ��������� "login sessions"
//����� ������ ������� serialize\deserialize.
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

            //�������� ��������� ���������
            passport.use(new LocalStrategy({
                    usernameField: 'login',
                    passwordField: 'password'
                },
                function(username, password, next) {
                    //���� ������������ � ��������� ������� ��� email'��
                    Users.findOne({
                            or: [{
                                login: username
                            }, {
                                email: username
                            }]
                        },function(error, user) {
                            //��������� next-callback'�:
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

            //����������� RememberMe ���������
            passport.use(new RememberMeStrategy({
                    key: 'token' //��������� ��� cookie, ��� �������� ��� token
                },
                function(token, done) {
                    //���� ������������ � ���� token'��
                    Users
                        .findOne({
                            autoLoginHash: token
                        }, function(error, user) {
                            if (error) {
                                done(error);
                            } else if (!user) {
                                done(null, false);
                            } else {
                                //����� �������������� token � ����� ������������
                                delete user.autoLoginHash;
                                user.save(function() {});
                                done(null, user);
                            }
                        });
                }, function(user, done) {
                    //� ���������� ����� token
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