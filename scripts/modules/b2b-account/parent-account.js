define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    "modules/models-customer",
    'modules/mozu-grid/mozugrid-view',
    'modules/mozu-grid/mozugrid-pagedCollection',
    "modules/views-paging",
    'modules/editable-view',
    "modules/models-quotes",
    "modules/models-b2b-account"],
    function ($, api, _, Hypr, Backbone, HyprLiveContext, CustomerModels, MozuGrid, MozuGridCollection,
        PagingViews, EditableView, QuoteModels, B2BAccountModels) {

        var currentAccountId;
        var changeParentAccountModalView = Backbone.MozuView.extend({
            templateName: "modules/b2b-account/account-hierarchy/change-parent-account-modal",
            initialize: function () {
                Backbone.MozuView.prototype.initialize.apply(this, arguments);
            },
            render: function (currentAccount, parentAccount, allParentAccounts) {
                var self = this;
                Backbone.MozuView.prototype.render.apply(this, arguments);
                if (currentAccount) {
                    currentAccountId = currentAccount.id;
                }
                if (parentAccount) {
                    self.model.set('parentAccountName', parentAccount.companyOrOrganization);
                }
                if (allParentAccounts) {
                    self.model.set("b2bAccounts", allParentAccounts);
                    self.render();
                }
                $(".modal-dialog").attr("id", "mz-parent-modal");
                $('#updateParentbtn').prop('disabled', true);

                $(".mz-l-formfieldgroup-halfsize").on('change', function (e) {
                    e.preventDefault();
                    if ($(".mz-l-formfieldgroup-halfsize").val() !== "") {
                        $('#updateParentbtn').prop('disabled', false);
                    }
                    else {
                        $('#updateParentbtn').prop('disabled', true);
                    }
                });
            },
            renderView: function (template) {
                this.$el.html(this.template);
                this.$el.modal({ show: true }); // dont show modal on instantiation
            },
            updateParentAccount: function () {
                var self = this;
                var parentAccId = $(".mz-l-formfieldgroup-halfsize").val();
                var apib2bAccount = new B2BAccountModels.b2bAccount({ id: currentAccountId, parentAccountId: parentAccId });
                apib2bAccount.apiModel.changeParent().then(function (res) {
                    window.location.href += encodeURI("Account Hierarchy");
                    window.location.reload();
                }, function (error) {
                    self.showMessageBar(error);
                });
            },
            showMessageBar: function (error) {
                var self = this;
                self.model.set("error", error); 
                self.model.syncApiModel();
                self.render();
            },
            handleDialogCancel: function () {
                var self = this;
                self.model.set("error", "");
                self.model.syncApiModel();
            }
        });

        return {
            'changeParentAccountModalView': changeParentAccountModalView
        };
    });
