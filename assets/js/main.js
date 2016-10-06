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
    sendAuthCallback({success: true});
}

function getBackboneModels() {
    $.ajax({
        url: "/backbonemodel",
        success: getModelsCallback
    });
}

function getModelsCallback(data) {
    if (data) {
        for (var i = 0, size = data.length; i < size; i++){
            var obj = {};
            obj[data[i].name] = Backbone.Model.extend(data[i]);
            App.Models[data[i].name] = obj[data[i].name];

        }
        init();
        App.Models.UserTable = Backbone.Model.extend({});
        App.Views.UserTable = Backbone.View.extend({
            initialize: function() {
                this.collection.on('add', this.addOne, this);
            },
            tagName: 'table',
            className: 'table table-striped',
            render: function() {
                var tableHeader = '<tr><th>Логин</th><th>Email</th><th>Имя</th><th>Владелец</th><th>Приложение</th><th>Группа</th><th>Права</th><th></th><th></th></tr>';
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
                //console.log(this.model.toJSON());
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

        App.Models.AppsSelect = Backbone.Model.extend({});
        App.Views.AppsSelect = Backbone.View.extend({
            initialize: function() {
                this.collection.on('add', this.addOne, this);
            },
            tagName: 'select',
            id: 'userFormApp',
            render: function() {
                this.collection.each(this.addOne, this);
                return this;
            },
            addOne: function(app) {
                //console.log(user);
                var appView = new App.Views.App({
                    model: app
                });
                this.$el.append(appView.render().el);
            }
        });
        App.Views.App = Backbone.View.extend({
            initialize: function() {
                this.model.on('change', this.render, this);
                this.model.on('destroy', this.remove, this);
            },
            tagName: 'option',
            render: function() {
                //console.log(this.model.toJSON());
                $(this.el).attr('value',this.model.get('id')).html(this.model.get('name'));
                return this;
            },
            remove: function() {
                this.$el.remove();
            }
        });

        App.Models.CustomersSelect = Backbone.Model.extend({});
        App.Views.CustomersSelect = Backbone.View.extend({
            initialize: function() {
                this.collection.on('add', this.addOne, this);
            },
            tagName: 'select',
            id: 'userFormCustomer',
            render: function() {
                this.collection.each(this.addOne, this);
                return this;
            },
            addOne: function(customer) {
                //console.log(user);
                var customerView = new App.Views.Customer({
                    model: customer
                });
                this.$el.append(customerView.render().el);
            }
        });
        App.Views.Customer = Backbone.View.extend({
            initialize: function() {
                this.model.on('change', this.render, this);
                this.model.on('destroy', this.remove, this);
            },
            tagName: 'option',
            render: function() {
                //console.log(this.model.toJSON());
                $(this.el).attr('value',
                this.model.get('id')).html(this.model.get('name'));
                return this;
            },
            remove: function() {
                this.$el.remove();
            }
        });

        App.Models.GroupsSelect = Backbone.Model.extend({});
        App.Views.GroupsSelect = Backbone.View.extend({
            initialize: function() {
                this.collection.on('add', this.addOne, this);
            },
            tagName: 'select',
            id: 'userFormGroup',
            render: function() {
                this.collection.each(this.addOne, this);
                return this;
            },
            addOne: function(group) {
                //console.log(user);
                var groupView = new App.Views.Group({
                    model: group
                });
                this.$el.append(groupView.render().el);
            }
        });
        App.Views.Group = Backbone.View.extend({
            initialize: function() {
                this.model.on('change', this.render, this);
                this.model.on('destroy', this.remove, this);
            },
            tagName: 'option',
            render: function() {
                //console.log(this.model.toJSON());
                $(this.el).attr('value',
                this.model.get('id')).html(this.model.get('name'));
                return this;
            },
            remove: function() {
                this.$el.remove();
            }
        });

        App.Models.RolesSelect = Backbone.Model.extend({});
        App.Views.RolesSelect = Backbone.View.extend({
            initialize: function() {
                this.collection.on('add', this.addOne, this);
            },
            tagName: 'select',
            id: 'userFormRole',
            render: function() {
                this.collection.each(this.addOne, this);
                return this;
            },
            addOne: function(role) {
                //console.log(user);
                var roleView = new App.Views.Role({
                    model: role
                });
                this.$el.append(roleView.render().el);
            }
        });
        App.Views.Role = Backbone.View.extend({
            initialize: function() {
                this.model.on('change', this.render, this);
                this.model.on('destroy', this.remove, this);
            },
            tagName: 'option',
            render: function() {
                //console.log(this.model.toJSON());
                $(this.el).attr('value',
                this.model.get('id')).html(this.model.get('name'));
                return this;
            },
            remove: function() {
                this.$el.remove();
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

                var appsSelectView, customersSelectView, groupsSelectView, rolesSelectView;
                var apps = new App.Models.Apps();
                var body = this.$el;
                var userForm = this;
                apps.fetch({
                    success: function (apps_model, apps_response) {
                        window.apps = new App.Collections.Apps(apps_response);
                        appsSelectView = new App.Views.AppsSelect({
                            collection: window.apps
                        });
                        body.find('div.modal-body').append('<label for="userFormApp">Приложение</label>');
                        var app_select = appsSelectView.render().el;
                        body.find('div.modal-body').append(app_select);
                        $(app_select).children().each(function() {
                            if (!isEmpty(userForm.model.attributes) && $(this).text() == userForm.model.attributes.app.name){
                                $(this).attr("selected","selected");
                            }
                        });
                        body.find('div.modal-body').append('<br/>');
                        var customers = new App.Models.Customers();
                        customers.fetch({
                            success: function (customers_model, customers_response) {
                                window.customers = new App.Collections.Customers(customers_response);
                                customersSelectView = new App.Views.CustomersSelect({
                                    collection: window.customers
                                });
                                body.find('div.modal-body').append('<label for="userFormCustomer">Владелец</label>');
                                var customer_select = customersSelectView.render().el;
                                body.find('div.modal-body').append(customer_select);

                                $(customer_select).children().each(function() {
                                    if (!isEmpty(userForm.model.attributes) && $(this).text() == userForm.model.attributes.customer.name){
                                        $(this).attr("selected","selected");
                                    }
                                });
                                body.find('div.modal-body').append('<br/>');
                                var groups = new App.Models.Groups();
                                groups.fetch({
                                    success: function (groups_model, groups_response) {
                                        window.groups = new App.Collections.Groups(groups_response);
                                        groupsSelectView = new App.Views.GroupsSelect({
                                            collection: window.groups
                                        });
                                        body.find('div.modal-body').append('<label for="userFormGroup">Группа</label>');
                                        var group_select = groupsSelectView.render().el;
                                        body.find('div.modal-body').append(group_select);
                                        $(group_select).children().each(function() {
                                            if (!isEmpty(userForm.model.attributes) && $(this).text() == userForm.model.attributes.group.name){
                                                $(this).attr("selected","selected");
                                            }
                                        });
                                        body.find('div.modal-body').append('<br/>');
                                        var roles = new App.Models.Roles();
                                        roles.fetch({
                                            success: function (roles_model, roles_response) {
                                                window.roles = new App.Collections.Roles(roles_response);
                                                rolesSelectView = new App.Views.RolesSelect({
                                                    collection: window.roles
                                                });
                                                body.find('div.modal-body').append('<label for="userFormRole">Права</label>');
                                                var roles_select = rolesSelectView.render().el;
                                                body.find('div.modal-body').append(roles_select);
                                                $(roles_select).children().each(function() {
                                                    if (!isEmpty(userForm.model.attributes) && $(this).text() == userForm.model.attributes.role.name){
                                                        $(this).attr("selected","selected");
                                                    }
                                                });
                                                body.find('div.modal-body').append('<br/>');
                                                return userForm;
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                });
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
                var newUserCustomer = this.$el.find('#userFormCustomer').val();
                var newUserGroup = this.$el.find('#userFormGroup').val();
                var newUserRole = this.$el.find('#userFormRole').val();
                var newUserApp = this.$el.find('#userFormApp').val();
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

                this.model.set('login', newUserLogin);
                this.model.set('password', newUserPassword);
                this.model.set('name', newUserName);
                this.model.set('email', newUserEmail);
                this.model.set('customer', newUserCustomer);
                this.model.set('app', newUserApp);
                this.model.set('group', newUserGroup);
                this.model.set('role', newUserRole);

                if (this.model.attributes.id) {
                    this.model.save();
                } else {
                    this.model.save(null,{success: function (res_model, response) {
                         users.create(res_model);
                    }});
                }
                this.$el.modal('hide');
            }
        });

        App.Collections.Users = Backbone.Collection.extend({
            model: App.Models.Users,
            url: '/user'
        });
        App.Collections.Customers = Backbone.Collection.extend({
            model: App.Models.Customers,
            url: '/customers'
        });
        App.Collections.Apps = Backbone.Collection.extend({
            model: App.Models.Apps,
            url: '/apps'
        });
        App.Collections.Groups = Backbone.Collection.extend({
            model: App.Models.Groups,
            url: '/groups'
        });
        App.Collections.Roles = Backbone.Collection.extend({
            model: App.Models.Roles,
            url: '/roles'
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
            data: "login=" + $("#inputLogin").val() + "&password=" + $("#inputPassword").val(),
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

function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}