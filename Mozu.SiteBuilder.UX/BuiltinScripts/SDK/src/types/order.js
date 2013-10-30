ApiObject.types.order = utils.inherit(ApiObject, {
    addNewUser: function (login) {
        var self = this;
        return self.api.create('user', login).then(function (user) {
            return user.login();
        }).then(function () {
            return self.action('setUserId');
        });
    }
});