var utils = require('../utils');
var errors = require('../errors');

errors.register({
    'CREATE_TOKEN_FAILED': 'Create payment token failed for the following reason: {0}',
    'GET_SESSION_FAILED': 'Get payment session failed for the following reason: {0}'
});

module.exports = {
    create: function (options) {
        var self = this;
        var payload = {token: self.data.tokenObject, type: self.data.type.toUpperCase()};
        return this.api.action(this, 'create', payload).then(function (res) {
            return res;
        }, function (error) {
            errors.throwOnObject(self, 'CREATE_TOKEN_FAILED', error);
        }
        );
    },
    thirdPartyPaymentExecute: function (payload) {
        var self = this;
        return this.api.action(this, 'execute', payload).then(function (res) {
            return res;
        }, function (error) {
            errors.throwOnObject(self, 'GET_SESSION_FAILED', error.msg);
        });
    }
}
