define(["underscore", "modules/backbone-mozu"], function (_, Backbone) {
  var Token = Backbone.MozuModel.extend({
      mozuType: 'token'
  });
  return {
      Token: Token
  };
});
