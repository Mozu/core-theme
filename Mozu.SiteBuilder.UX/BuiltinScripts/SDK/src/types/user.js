ApiObject.types.user = {
    postconstruct: function () {
        var self = this;
        this.on('sync', function (json) {
            if (json && json.authTicket && json.authTicket.accessToken) {
                self.api.context.UserClaims(json.authTicket.accessToken);
                self.api.fire('login', json.authTicket);
            }
        });
    }
};