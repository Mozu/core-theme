define(["modules/jquery-mozu", 'modules/api', "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", 'modules/models-customer'], function ($, api, _, Hypr, Backbone, HyprLiveContext, CustomerModels) {

    var AccountHierarchyView = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/account-hierarchy/account-hierarchy",
        render: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            self.fixMargins();
        },
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        fixMargins: function () {
            $(document).ready(function () {
                //close menu if we click on outside of menu
                $(document).on("click", function (event) {
                    if (!$(event.target).closest(".dropdown-content").length && !$(event.target).closest(".three-dots").length) {
                        $(".account-hierarchy .dropdown-content").removeClass("active");
                    }
                });

                //fix margins
                $(".node:not(:has(.caret))").addClass("fix-margin");

                //open first node of the tree always
                $(".account-hierarchy>ul.tree li").first().children(".nested").addClass("active");
                $('.tree > li > .node > span').addClass('caret-down');
            });
        },
        toggleNodes: function (e) {
            $(e.currentTarget).parent().parent().children(".nested").toggleClass("active");
            $(e.currentTarget).toggleClass("caret-down");
        },
        showThreeDotsMenu: function (e) {
            //hide all menus first
            $(".account-hierarchy .dropdown-content").removeClass("active");
            //show menu
            $(e.currentTarget).closest('li').children('.dropdown-content').toggleClass("active");
        },
        addChildAccount: function (e) {
            //todo: need to implement this method in future.
        },
        expandAll: function (e) {
            $(".tree .caret").addClass("caret-down");
            $(".nested").addClass("active");
        },
        collapseAll: function (e) {
            $(".tree .caret").removeClass("caret-down");
            $(".nested").removeClass("active");
            $(".account-hierarchy>ul.tree li").first().children(".nested").addClass("active");
            $('.tree > li > .node > span').addClass('caret-down');
        },
        viewAccount: function (e) {
            //todo: need to implement this method in future.
            var accountId = e.currentTarget.dataset.mzValue;
        },
        changeParentAccount: function (e) {
            //todo: need to implement this method in future.
            var accountId = e.currentTarget.dataset.mzValue;
        }
    });

    var AccountHierarchyModel = Backbone.MozuModel.extend({
        mozuType: 'b2bAccountHierarchy',
        initialize: function () {
            var self = this;
            self.initApiModel();
            self.apiGet({ id: require.mozuData('user').accountId }).then(function (response) {
                self.set("hierarchy", self.processAccountHierarchy(response.data));
                self.syncApiModel();
            });
            self.set("isUserAdmin", self.isUserAdmin());
        },
        userHasBehavior: function (behaviorId) {
            var behaviors = require.mozuData('user').behaviors;
            if (behaviors) {
                return behaviors.includes(behaviorId);
            }
            return false;
        },
        isUserAdmin: function () {
            //Only admin should have 1000 behavior.
            //1000 (Manage Account Information) -> B2B (admin) shopper should be able to modify info about their B2B account.
            return this.userHasBehavior(1000);
        },
        isUserPurchaser: function () {
            //purchaser have 1005 behavior
            //1005 (Purchase Order) -> B2B shopper should be able to use the account's purchase order for payment.
            return !this.isUserAdmin() && this.userHasBehavior(1005);
        },
        processAccountHierarchy: function (data) {
            var self = this;
            if (data.hierarchy) {
                //set a flag on top node of the account hierarchy
                data.hierarchy.isTopAccount = true;
                self.setAccountOnHierarchy(data.hierarchy, data.accounts, false);
            }
            return data.hierarchy;
        },
        setAccountOnHierarchy: function (item, accounts, isDescendantOfAssociatedAccount) {
            var self = this;
            // isDescendantOfAssociatedAccount - This parameter will be false until recursion finds the account associated with the current user. On further recursion it will enable descendant behaviors.
            if (!isDescendantOfAssociatedAccount) {
                //Check whether this is a current logged in users associated account.
                isDescendantOfAssociatedAccount = require.mozuData('user').accountId === item.id;
                //set "View Account" menu on current account.
                item.canViewAccount = isDescendantOfAssociatedAccount && (self.isUserAdmin() || self.isUserPurchaser());
            }
            else {
                //set menu's on all current associated accounts descendant accounts.
                item.canViewAccount = self.isUserAdmin() || self.isUserPurchaser();
                item.canChangeParentAccount = self.isUserAdmin();
            }

            item.account = self.getAccount(item.id, accounts);

            if (item.children) {
                //loop over descendants.
                for (var i = 0; i < item.children.length; i++) {
                    self.setAccountOnHierarchy(item.children[i], accounts, isDescendantOfAssociatedAccount);
                }
            }
        },
        getAccount: function (accountId, accounts) {
            for (var i = 0; i < accounts.length; i++) {
                if (accounts[i].id == accountId)
                    return accounts[i];
            }
        }
    });

    return {
        'AccountHierarchyView': AccountHierarchyView,
        'AccountHierarchyModel': AccountHierarchyModel
    };
});
