/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var btoa = require('btoa');
module.exports = {
    attributes: {
        name: {
            required: true,
            unique: false,
            type: "string"
		},
	 	login: {
	            required: true,
	            unique: true,
	            type: "string"
		},
	 	email: {
	            required: true,
	            unique: true,
	            type: "string",
	            email: true
		},
		encryptedPassword: {
	            type: 'string'
		},
		toJSON: function() {
	            var obj = this.toObject();
	 	    delete obj.password;
	  	    return obj;
		}
    },
    beforeCreate: function (values, next) {
    	if (!values.password) next("password required!");
        values.encryptedPassword = btoa(values.password);
		delete values.password;
		next();
    },
    beforeUpdate: function (values, next) {
        if (values.password) {
	    values.encryptedPassword = btoa(values.password);
            delete values.password;
            next();
        } else {
            next();
        }
    }
};