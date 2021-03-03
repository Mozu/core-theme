define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    'modules/mozu-grid/mozugrid-view',
    'modules/mozu-grid/mozugrid-pagedCollection',
    "modules/models-quotes"],
    function ($, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection, QuoteModels) {


        var accountInfo = require.mozuData('user');


        var deleteQuoteView = Backbone.MozuView.extend({
            templateName: "modules/b2b-account/quotes/delete-quote",

            initialize: function () {
                Backbone.MozuView.prototype.initialize.apply(this, arguments);
            },
            render: function (row, quotesGrid) {
                var self = this;
                self.model.set("quoteName", row.attributes.name);
                Backbone.MozuView.prototype.render.apply(this, arguments);

                $(".modal-dialog").attr("id", "mz-delete-modal");

                $('[data-mz-action="deleteQuoteHandler"]').click(function (e) {
                    e.preventDefault();
                    var quoteId = row.id;
                    var quote = new QuoteModels.Quote({
                        id: quoteId
                    });
                    return quote.apiModel['delete']().then(function (res) {
                        quotesGrid.refreshGrid();
                        self.showMessageBar({
                            message: "Quote has been deleted successfully"
                        }, false);
                        setTimeout(function () {
                            $('#mz-delete-modal').hide();
                            $(".modal-backdrop").hide();
                            $("body").removeClass('modal-open');
                        }, 4000);
                    }, function (error) {
                        self.showMessageBar(error, true);
                    }
                    );
                });
            },
            renderView: function () {
                var self = this;
                this.$el.html(this.template);
                this.$el.modal({ show: true }); // dont show modal on instantiation
                $(".modal-backdrop").show();
            },
            showMessageBar: function (meessage, isError) {
                var self = this;
                if (isError) {
                    self.model.messagetype = "<ul class='is-showing mz-errors'>";
                } else {
                    self.model.messagetype = "<ul class='is-showing mz-success'>";
                }
                $('.mz-messagebar').empty();
                this.$('.mz-messagebar').append(
                    "<div class='mz-messagebar' data-mz-mozu-message-bar>" +
                    self.model.messagetype + "<li class='mz-message-item'>" + meessage.message + "</li>" +
                    "</ul>"
                );
            }
        });

        return {
            'deleteQuoteView': deleteQuoteView
        };
    }
);
