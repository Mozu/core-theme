ApiObject.types.login = utils.inherit(ApiObject, {
    postconstruct: function (type, json) {
        if (json.authTicket && json.authTicket.accessToken) {
            self.api.context.UserClaims(json.authTicket.accessToken);
            self.api.fire('login', json.authTicket);
        }
    }
});