define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext"],
    function ($, api, _, Hypr, Backbone, HyprLiveContext) {
        var modalId = "mz-add-address-modal";
        var addNewAddressView = Backbone.MozuView.extend({
            templateName: "modules/b2b-account/quotes/add-new-address-modal",
            initialize: function () {
                Backbone.MozuView.prototype.initialize.apply(this, arguments);

            },
            render: function () {
                var self = this;

                Backbone.MozuView.prototype.render.apply(this, arguments);

                this.$el.children('.modal-dialog').attr("id", modalId);

            },
            renderView: function () {
                var self = this;
                this.$el.html(this.template);
                this.$el.modal({ show: true }); // dont show modal on instantiation
                $(".modal-backdrop").show();
            },
            closeModal: function () {
                $("#" + modalId).hide();
                $(".modal-backdrop").hide();
                $("body").removeClass('modal-open');
            }
        });
        return {
            'AddNewAddressView': addNewAddressView
        };
    });