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
    function ($, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection,QuoteModels) {


        var accountInfo = require.mozuData('user');

        var maxEmailAllowed = 20;

        var emailQuoteView = Backbone.MozuView.extend({
            templateName: "modules/b2b-account/quotes/email-quote",

            initialize: function () {
                Backbone.MozuView.prototype.initialize.apply(this, arguments);
            },
            render: function (quoteId) {
                var self = this;
                self.model.set("quoteId", quoteId);
                Backbone.MozuView.prototype.render.apply(this, arguments);
                if (!accountInfo.isSalesRep) {
                    $("#sendEmailText").val(accountInfo.email);
                }
                $(".modal-dialog").attr("id", "mz-email-modal");
                $("#sendEmailText").focus();
                $('[data-mz-action="handleSendemail"]').click(function (e) {
                    e.preventDefault();
                    var invalidEmails = [];
                    var validEmails = [];
                    var emails;
                    if (!self.model.attributes.inputEmails && !accountInfo.isSalesRep) {
                        emails = $("#sendEmailText").val();
                    }
                    else {
                        emails = self.model.attributes.inputEmails;
                        if(!emails){
                            emails='';
                        }
                    }

                    var result = emails.split(",");
                    for (var i = 0; i < result.length; i++) {
                        if (!result[i].trim().match(Backbone.Validation.patterns.email)) {
                            if (result[i].trim() !== "") {
                                invalidEmails.push(result[i].replace('<', '&lt').replace('>', '&gt'));
                            }
                        } else {
                            validEmails.push(result[i].trim());
                        }
                    }

                    var quoteId = self.model.get("quoteId");
                    if (invalidEmails.length === 0 && validEmails.length !== 0 && validEmails.length <= maxEmailAllowed) {
                        var quote = new QuoteModels.Quote({
                            id: quoteId
                        });
                        return quote.apiModel.email(validEmails).then(function (res) {
                            self.showMessageBar({ message: "Email has been sent successfully" }, false);
                            self.model.set("inputEmails", "");
                            setTimeout(function () {
                                $('#mz-email-modal').hide();
                                $(".modal-backdrop").hide();
                                $("body").removeClass('modal-open');

                            }, 4000);

                        }, function (error) {
                            if (error.message) {
                                self.showMessageBar(error, true);
                            } else {
                                self.showMessageBar({
                                    message: "Bad Request Error"
                                }, true);
                            }
                        }
                        );

                    } else {
                        if (invalidEmails.length == 1) {
                            self.showMessageBar({
                                message: "Please enter a valid email address " + invalidEmails
                            }, true);
                        }
                        else if (validEmails.length === 0 && invalidEmails.length === 0) {
                            self.showMessageBar({
                                message: "Please enter at least 1 valid email address"
                            }, true);
                        }
                        else if (validEmails.length >= maxEmailAllowed) {
                            self.showMessageBar({ message: "Max " + maxEmailAllowed + " email addresses are allowed" }, true);
                        }
                        else {
                            self.showMessageBar({ message: "Please enter valid email addresses " + invalidEmails }, true);
                        }
                    }
                });

                $('[data-mz-action="checkEmail"]').on('keyup', function (e) {
                    e.preventDefault();
                    $('.mz-messagebar').empty();
                    self.model.set("inputEmails", e.target.value);
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
            'emailQuoteView': emailQuoteView
        };
    }
);
