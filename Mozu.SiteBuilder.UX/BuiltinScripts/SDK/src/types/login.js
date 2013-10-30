ApiObject.types.login = utils.inherit(ApiObject, {
    postconstruct: function (type, json) {
        if (json.AuthTicket && json.AuthTicket.AccessToken) {
            self.api.context.UserClaims(json.AuthTicket.AccessToken);
            self.api.fire('login', json.AuthTicket);
        }
    }
});