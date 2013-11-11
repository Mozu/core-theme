ApiObject.types.login = utils.inherit(ApiObject, {
    postconstruct: function (type, json) {
        if (json.authTicket && json.authTicket.accessToken) {
            this.api.context.UserClaims(json.authTicket.accessToken);
            this.api.fire('login', json.authTicket);
        }
    }
});