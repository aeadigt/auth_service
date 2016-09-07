/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

/*
module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
*/

module.exports.bootstrap = function(cb) {
    var passport = require('passport'), //���������� passport
        http = require('http'), //� http
        initialize = passport.initialize(),
        session = passport.session(),
        //����������� ������ :)
        methods = ['login', 'logIn', 'logout', 'logOut', 'isAuthenticated', 'isUnauthenticated'];

    sails.removeAllListeners('router:request'); //������� ��� listeners � request'��

    sails.on('router:request', function(req, res) { //� ��������� ���� event-listener
        initialize(req, res, function() {
            session(req, res, function(error) {
                if (error) {
                    return sails.config[500](500, req, res);
                }

                for (var i = 0; i < methods.length; i++) {
                    //Bind'�� ����������� ������ � req-������
                    req[methods[i]] = http.IncomingMessage.prototype[methods[i]].bind(req);
                }

                //���������� ������ sails � �������� ������ route
                sails.router.route(req, res);
            });
        });
    });
    //IMPORTANT: �� �������� �������� cb()
    //����� Sails ������ �� ����������
    cb();
};