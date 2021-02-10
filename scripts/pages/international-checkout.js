require([
  "modules/jquery-mozu",
  "modules/backbone-mozu"
], function($, Backbone) {
  function getQueryStrings() {
    var assoc = {};
    var decode = function(s) {
      return decodeURIComponent(s.replace(/\+/g, " "));
    };
    var queryString = location.search.substring(1);
    var keyValues = queryString.split("&");

    for (var i in keyValues) {
      var key = keyValues[i].split("=");
      if (key.length > 1) {
        assoc[decode(key[0])] = decode(key[1]);
      }
    }

    return assoc;
  }
  //International Checkout template
  var InternationalCheckoutView = Backbone.MozuView.extend({
    templateName: "modules/borderFree/border-free-checkout",
    initialize: function() {},
    render: function() {
      Backbone.MozuView.prototype.render.apply(this);
      return this;
    }
  });

  $(document).ready(function() {
    //Get URL Param for auto search
    var qs = getQueryStrings(),
    borderFreeData;
    $(".mz-pagetitle").show();
    //check page and response type
    if(qs.ooStatus == "CHECKOUT"){
      borderFreeData = {
        fullEnvoyUrl: decodeURIComponent(atob(qs.fullEnvoyUrl)),
        checkoutDomain1: qs.checkoutDomain1,
        checkoutDomain2: qs.checkoutDomain2,
        ooStatus: qs.ooStatus
      };
    }else{
      borderFreeData = {
        ooStatus : qs.ooStatus
      };
      $(".mz-pagetitle").hide();
    }
    if(qs.ooStatus == "FAILURE"){
      borderFreeData = {
        ooStatus : qs.ooStatus,
        messages : [{message: decodeURIComponent(qs.errMessage)}]
      };
    }
    var internationalCheckoutViewModel = Backbone.MozuModel.extend();
    var internationalCheckoutModel = new internationalCheckoutViewModel();
    internationalCheckoutModel.set("borderFreeData", borderFreeData);
    var internationalCheckoutView = (window.view = new InternationalCheckoutView(
      {
        el: $(".international-checkout"),
        model: internationalCheckoutModel
      }
    ));
    internationalCheckoutView.render();
  });
});
