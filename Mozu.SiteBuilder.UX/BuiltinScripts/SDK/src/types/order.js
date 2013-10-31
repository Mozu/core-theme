ApiObject.types.order = utils.inherit(ApiObject, {
    addNewUser: function (login) {
        var self = this;
        return self.api.create('user', login).then(function (user) {
            return user.action('login', { emailAddress: user.prop('emailAddress'), password: user.prop('password') });
        }).then(function () {
            return self.action('setUserId');
        });
    }
});