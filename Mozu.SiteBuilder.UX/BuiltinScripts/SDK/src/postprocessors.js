// BEGIN POSTPROCESSORS

var ApiPostProcessors = {
    login: function (obj) {
        var newClaims = obj.prop('AuthTicket');
        if (newClaims && newClaims.AccessToken) {
            obj.api.context.UserClaims(newClaims.AccessToken);
            obj.api.fire('login', newClaims);
        }
    }
};