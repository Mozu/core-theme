define(['modules/api',
        'modules/backbone-mozu',
        'underscore',
        'modules/jquery-mozu',
        'hyprlivecontext',
        'hyprlive',
        'modules/preserve-element-through-render'],
        function (api, Backbone, _, $, HyprLiveContext, Hypr, preserveElement) {

          var ConfirmationView = Backbone.MozuView.extend({
            templateName: 'modules/confirmationv2/confirmation-detail',
            render: function() {
              Backbone.MozuView.prototype.render.apply(this);
            }
          });

          var ConfirmationModel = Backbone.MozuModel.extend({
            mozuType: 'checkout',
            initialize: function() {
              var self = this;
              var pageContext = require.mozuData('pagecontext'),
                  orderAttributeDefinitions = pageContext.storefrontOrderAttributes;
              self.set('orderAttributeDefinitions', orderAttributeDefinitions);
            }
          });

          $(document).ready(function(){

            var confModel = ConfirmationModel.fromCurrent();
            var confirmationView = new ConfirmationView({
                el: $('#confirmation-container'),
                model: confModel
            });
            confirmationView.render();

          });


        });
