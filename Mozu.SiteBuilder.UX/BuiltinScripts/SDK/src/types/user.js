var CONSTANTS = require('../constants/default');

module.exports = {
    postconstruct: function () {
        var self = this;
        this.on('sync', function (json) {
            if (json && json.authTicket && json.authTicket.accessToken) {
                self.api.context.UserClaims(json.authTicket.accessToken);
                self.api.fire('login', json.authTicket);
            }
        });
    },
    createAndLogin: function(payload) {
        var self = this;
        if (!payload) payload = this.data;
        return this.create(payload).then(function () {
            return self.login({
                emailAddress: payload.emailAddress,
                password: payload.password
            });
        });
    },
    createWithCustomer: function (payload) {
        var self = this;
        return this.createAndLogin(payload).then(function () {
            return self.api.action('customer', 'create', {
                userId: self.prop('id')
            })
        }).then(function (customer) {
            return customer.addContact({
                email: self.prop('emailAddress'),
                firstName: self.prop('firstName'),
                lastNameOrSurname: self.prop('lastName'),
                address: {}
            });
        });
    },
    behaviorsById: function () {
        return CONSTANTS.USER_BEHAVIORS_ID
    },
    behaviorsByName: function () {
        return CONSTANTS.USER_BEHAVIORS_Name
    },
    getBehaviorById: function(id){
        return CONSTANTS.USER_BEHAVIORS_ID[id];
    },
    getBehaviorByName: function (name) {
        var behaviorName = name.replace(" ", "_")
        return CONSTANTS.USER_BEHAVIORS_NAME[behaviorName];
    }
};