ApiObject.types.user = utils.inherit(ApiObject, {
    postconstruct: function () {
        var self = this;
        this.on('sync', function (json) {
            if (json.AuthTicket && json.AuthTicket.AccessToken) {
                self.api.context.UserClaims(json.AuthTicket.AccessToken);
                self.api.fire('login', json.AuthTicket);
            }
        });
    }
});