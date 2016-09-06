// GLOBALS
var globalFromForm, globalFromLogin, globalIsAuth;

$(document).ready(function() {
    window.App = {
        Models: {},
        Views: {},
        Collections: {},
        Router: {}
    };

    window.template = function(id) {
        return _.template($('#' + id).html());
    };
    App.Models.Header = Backbone.Model.extend({});
    App.Views.Header = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        tagName: 'div',
        className: 'navbar navbar-fixed-top header light-grey',
        template: template('headerTemplate'),
        events: {
            'click .logout': 'logout'
        },
        logout: function() {
            this.$el.find('.logout').hide();
            $.ajax({
                url: "/auth/logout",
                success: getBackboneModels,
                contentType: "application/json"
            });
            globalIsAuth = false;
        },
        render: function() {
            var template = this.template({auth: globalIsAuth});
            this.$el.html(template);
            return this;
        }
    });
    window.headerView = new App.Views.Header({
        model: App.Models.Header
    });
    $('#header').html(window.headerView.$el);
    getBackboneModels();
});

function authentication() {
    console.log("авторизация document.cookie: " + document.cookie);
    //if (document.cookie) {
        sendAuthCallback({success: true});
    //}
}

function getBackboneModels() {
    $.ajax({
        url: "/backbonemodel",
        success: getModelsCallback
    });
}

function getModelsCallback(data) {
    if (data){
        for (var i = 0, size = data.length; i < size; i++){
            var obj = {};
            obj[data[i].name] = Backbone.Model.extend(data[i]);
            App.Models[data[i].name] = obj[data[i].name];
            init();
        }
        App.Models.UserTable = Backbone.Model.extend({});
        App.Views.UserTable = Backbone.View.extend({
            initialize: function() {
                this.collection.on('add', this.addOne, this);
            },
            tagName: 'table',
            className: 'table table-striped',
            render: function() {

                var tableHeader = '<tr><th>Логин</th><th>Имя</th><th>Email</th><th></th><th></th></tr>';
                this.$el.append(tableHeader);
                this.collection.each(this.addOne, this);
                return this;
            },
            addOne: function(user) {
                var userView = new App.Views.User({
                    model: user
                });
                this.$el.append(userView.render().el);
            }
        });

        App.Views.User = Backbone.View.extend({
            initialize: function() {
                this.model.on('change', this.render, this);
                this.model.on('destroy', this.remove, this);
            },
            tagName: 'tr',
            template: template('userRowTemplate'),
            render: function() {
                var template = this.template(this.model.toJSON());
                this.$el.html(template);
                return this;
            },
            remove: function() {
                this.$el.remove();
            },
            events: {
                'click .edit': 'editUser',
                'click .delete': 'destroyUser'
            },
            editUser: function(e) {
                new App.Views.UserForm({
                    model: this.model
                });
                // var newUserLogin = prompt('Как переименовать пользователя?', this.model.get('login'));
                // if (!newUserLogin) return;
                // this.model.set('login', newUserLogin);
                // this.model.save();
            },
            destroyUser: function() {
                this.model.destroy();
            }
        });
        App.Views.UserForm = Backbone.View.extend({
            initialize: function() {
                this.render();
                if (this.model.attributes.id) {
                    this.$el.find('.modal-title').text('Редактировать пользователя');
                } else {
                    this.$el.find('.modal-title').text('Добавить пользователя');
                }
                this.$el.modal();
            },
            tagName: 'div',
            className: 'modal fade',
            attributes: {
                id: 'modalUserForm',
                tabindex: "-1",
                role: "dialog",
                'aria-labelledby': "userFormLabel",
                'aria-hidden': "true"
            },

            template: template('modalUserFormTemplate'),
            render: function() {
                var template = this.template(this.model.toJSON());
                this.$el.html(template);
                return this;
            },
            remove: function() {
                this.$el.remove();
            },
            events: {
                'click .save': 'saveUser'
            },
            saveUser: function() {
                var newUserLogin = this.$el.find('#userFormLogin').val();
                var newUserPassword = this.$el.find('#userFormPassword').val();
                var newUserName = this.$el.find('#userFormName').val();
                var newUserEmail = this.$el.find('#userFormEmail').val();
                if (!newUserLogin || !newUserPassword || !newUserName || !newUserEmail) {
                    alert('Поля Логин и Пароль должны быть заполнены!')
                    return;
                }


                var re =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(newUserEmail))
                {
                    alert('Please enter a valid email address.');
                    return;
                }
                /*
                this.model.set('login', newUserLogin);
                this.model.set('password', newUserPassword);
                this.model.set('name', newUserName);
                this.model.set('email', newUserEmail);
                */

                if (this.model.attributes.id) {
                    this.model.save({
                        login: newUserLogin,
                        password: newUserPassword,
                        name: newUserName,
                        email: newUserEmail
                    }, {
                        success: function() {
                            //console.log("saveUser success");
                        },
                        error: function() {
                            alert('Не удалось сохранить изменения');
                        }
                    });
                } else {
                    users.create(this.model);
                }
                this.$el.modal('hide');
            }
        });
        App.Collections.Users = Backbone.Collection.extend({
            model: App.Models.Users,
            url: '/user'
        });
        authentication();
    } else {
        alert('BackBone Models not exists in database!')
    }
}

// Start state
function init() {
    App.Models.AuthForm = Backbone.Model.extend({});
    App.Views.AuthForm = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        tagName: 'form',
        className: 'form-signin authform',
        events: {
            'submit': 'submit'
        },
        submit: function(e) {
            e.preventDefault();
            sendAuth();
        },
        render: function() {
            $('#main').html(this.$el.html(
                '<label for="inputLogin">Логин</label>'+
                '<input type="text" id="inputLogin" class="form-control" placeholder="Логин" required autofocus>'+
                '<label for="inputPassword">Пароль</label>'+
                '<input type="password" id="inputPassword" class="form-control" placeholder="Пароль" required>'+
                '<button id="authBtn" class="btn btn-lg btn-primary btn-block" type="submit">Авторизоваться</button>'
            ));
            return this;
        }
    });
    window.authFormView = new App.Views.AuthForm({
        model: App.Models.AuthForm
    });
}

function sendAuth() {
    if ($("#inputLogin").val() && $("#inputPassword").val()){
        $.ajax({
            url: "/auth/login",
            data: "token=" + btoa($("#inputLogin").val() + ":" + $("#inputPassword").val()),
            success: sendAuthCallback
        });
    } else {
        alert("Поля Логин и Пароль должны быть заполнены.");
    }
}

//return error or send get users
function sendAuthCallback(res) {
    if (res.success) { //Don't CHANGE variable res may have true or "error message"! For example: if (res && res == "Invalid password") --> possible
        /*
        globalIsAuth = true;
        headerView.$el.find('.logout').removeClass('hidden');
        window.headerView.$el.find('.logout').show();
        window.authFormView.remove();
        */
        var user = new App.Models.Users();
        user.fetch({
            success: getUsersCallback,
            error: function () {
                //alert('Users fetch error!');
            }
        });
    } else {
        alert(res);
    }
}

// print userTable
function getUsersCallback(model, response) {
    window.users = new App.Collections.Users(response);
    var userTableView = new App.Views.UserTable({
        collection: users
    });

    App.Models.TablePage = Backbone.Model.extend({});
    App.Views.TablePage = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        tagName: 'div',
        events: {
            'click .add': 'createUser'
        },
        createUser: function() {
            new App.Views.UserForm({
                model: new App.Models.Users()
            });
        },
        render: function() {
            $("#main").append(this.$el);
            this.$el.append('<h1>Управление аккаунтами</h1>');
            this.$el.append(userTableView.render().el);
            this.$el.append('<button class="btn btn-sm btn-success add">Добавить</button>');
            return this;
        }
    });
    window.tablePageView = new App.Views.TablePage({
        model: App.Models.TablePage
    });

    globalIsAuth = true;
    headerView.$el.find('.logout').removeClass('hidden');
    window.headerView.$el.find('.logout').show();
    window.authFormView.remove();
}