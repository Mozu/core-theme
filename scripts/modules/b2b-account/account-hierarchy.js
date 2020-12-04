define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext"
  ], function ($, api, _, Hypr, Backbone, HyprLiveContext) {
      
    var AccountHierarchyView = Backbone.MozuView.extend({
          templateName: 'modules/b2b-account/account-hierarchy/account-hierarchy',
          initialize: function(){
              var self = this;
              Backbone.MozuView.prototype.initialize.apply(this, arguments);
          },
          render: function(){
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
          }
      });
  
      var AccountHierarchyModel = Backbone.MozuModel.extend({
      });
      return {
          'AccountHierarchyView': AccountHierarchyView,
          'AccountHierarchyModel': AccountHierarchyModel
      };
  });
  