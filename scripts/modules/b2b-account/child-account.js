define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    "modules/models-customer",
    "modules/models-cart",
    "modules/models-b2b-account",
    "modules/product-picker/product-modal-view",
    "modules/product-picker/product-picker-view",
    "modules/models-product",
    "modules/b2b-account/wishlists",
    'modules/mozu-quotes-grid/mozuquotesgrid-view',
    'modules/mozu-grid/mozugrid-pagedCollection',
    "modules/views-paging",
    'modules/editable-view',
    "modules/models-quotes"],
    function ($, api, _, Hypr, Backbone, HyprLiveContext,
        CustomerModels, CartModels, B2BAccountModels, ProductModalViews,
        ProductPicker, ProductModels, WishlistModels, MozuGrid, MozuGridCollection,
        PagingViews, EditableView, QuoteModels) {

        var isValid = false;

        var childAccountModalView = Backbone.MozuView.extend({
            templateName: "modules/b2b-account/account-hierarchy/addchild-account-modal",
            initialize: function () {
                Backbone.MozuView.prototype.initialize.apply(this, arguments);
            },
            render: function (dropdownAccounts) {
                var self = this;

                Backbone.MozuView.prototype.render.apply(this, arguments);

                if (!self.model.get("b2bAccounts")) {
                    self.model.set("b2bAccounts", dropdownAccounts);
                    self.render();
                }
                $(".modal-dialog").attr("id", "mz-child-modal");
            },
            validateEmail: function ($email) {
                var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                return emailReg.test($email);
            },
            renderView: function () {
                var self = this;
                this.$el.html(this.template);
                this.$el.modal({ show: true }); // dont show modal on instantiation
            },
            createAccount: function () {
                var self = this;
                self.validateInput(self);

                if (self.isValid) {
                    self.createAccountApiCall($, B2BAccountModels);
                }
            },
            validateInput: function (self) {
                self.isValid = true;

                if ($("#firstName").val() === "") {
                    self.isValid = false;
                    $('[data-mz-validationmessage-for="firstName"]').show().text(Hypr.getLabel('firstNameMissing'));
                } else {
                    $('[data-mz-validationmessage-for="firstName"]').show().text('');
                }
                if ($("#lastName").val() === "") {
                    self.isValid = false;
                    $('[data-mz-validationmessage-for="lastName"]').show().text(Hypr.getLabel('lastNameMissing'));
                } else {
                    $('[data-mz-validationmessage-for="lastName"]').show().text('');
                }
                if ($("#companyName").val() === "") {
                    self.isValid = false;
                    $('[data-mz-validationmessage-for="companyName"]').show().text(Hypr.getLabel('companyNameMissing'));
                } else {
                    $('[data-mz-validationmessage-for="companyName"]').show().text('');
                }
                if ($("#email").val() === "" || !self.validateEmail($("#email").val())) {
                    self.isValid = false;
                    $('[data-mz-validationmessage-for="email"]').show().text(Hypr.getLabel('emailMissing'));
                } else {
                    $('[data-mz-validationmessage-for="email"]').show().text('');
                }
                if ($(".mz-l-formfieldgroup-halfsize").val() === "") {
                    self.isValid = false;
                    $('[data-mz-validationmessage-for="dropdown"]').show().text(Hypr.getLabel('accountMissing'));
                } else {
                    $('[data-mz-validationmessage-for="dropdown"]').show().text('');
                }
            },
            createAccountApiCall: function ($, B2BAccountModels) {
                var self = this;
                var locale = "en-US";
                var apiContext = require.mozuData('apicontext');
                if(apiContext && apiContext.headers['x-vol-locale']) {
                  locale = apiContext.headers['x-vol-locale'];
                }
                var json = JSON.parse(JSON.stringify(
                    {
                        "users": [
                            {
                                "emailAddress": $("#email").val(),
                                "userName": $("#email").val(),
                                "firstName": $("#firstName").val(),
                                "lastName": $("#lastName").val(),
                                "localeCode": locale,
                                "acceptsMarketing": "false",
                                "isActive": true
                            }
                        ],
                        "taxId": $("#taxId").val(),
                        "parentAccountId": $(".mz-l-formfieldgroup-halfsize").val(),
                        "companyOrOrganization": $("#companyName").val(),
                        "accountType": "B2B"
                    }));

                $(':input[type="submit"]').prop('disabled', true);
                $('.mz-cancel-button').prop('disabled', true);
                var apib2bAccount = new B2BAccountModels.b2bAccount(json);
                apib2bAccount.apiModel.create().then(function (res) {
                    window.location.reload();
                }, function (error) {
                    error.message = Hypr.getLabel('errorMessage') + " " + error.message;
                    self.showMessageBar(error);
                    $(':input[type="submit"]').prop('disabled', false);
                    $('.mz-cancel-button').prop('disabled', false);
                });
            },
            showMessageBar: function (error) {
                var self = this;
                self.model.set("error", error);
                $('.mz-messagebar').empty();
                this.$('.mz-messagebar').append(
                    "<div class='mz-messagebar' data-mz-mozu-message-bar>" +
                    "<ul class='is-showing mz-errors'>" + "<li class='mz-message-item'>" + error.message + "</li>" +
                    "</ul>" +
                    "<span class='dismiss-message' data-mz-action='dismissMessage'>X</span>" +
                    "</div>"
                );
            }
        });
        return {
            'childAccountModalView': childAccountModalView
        };
    });
