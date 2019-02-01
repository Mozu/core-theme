define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    'modules/models-customer',
    'modules/models-b2b-account',
    "modules/b2b-account/wishlists",
    "modules/b2b-account/users",
    "modules/b2b-account/orders",
    "modules/b2b-account/returns",
    "modules/b2b-account/payment-information",
    "modules/backbone-pane-switcher",
    'modules/b2b-account/shipping-information',
    "modules/b2b-account/account-info",
    'modules/b2b-account/custom-attributes'
],
    function ($, api, _, Hypr, Backbone, HyprLiveContext, CustomerModels, B2BAccountModels, Lists, Users, Orders, Returns, PaymentInformation, PaneSwitcher, ShippingInformation, AccountInfo, CustomAttributes) {

    var paneSwitcherModel = new PaneSwitcher.PaneSwitcherModel({
        panes: [
            {
                name: 'Account Information',
                view: new AccountInfo.InfoView({
                    model: CustomerModels.EditableCustomer.fromCurrent(),
                    messagesEl: $('#account-info-messages')
                })
            },
            {
                name: 'Orders',
                view: new Orders.OrdersView({
                    model: Orders.OrdersModel.fromCurrent()
                })
            },
            {
                name: 'Returns',
                view: new Returns.ReturnsView({
                    model: CustomerModels.EditableCustomer.fromCurrent()
                })
            },
            {
                name: 'Users',
                view: new Users.UsersView({
                    model: new Users.UsersModel({})
                })
            },
            {
                name: 'Lists',
                view: new Lists.WishlistsView({
                    model: new Lists.WishlistsModel({})
                })
            },
            {
                name: 'Shipping Information',
                view: new ShippingInformation.AddressBookView({
                    model: ShippingInformation.AddressBookModel.fromCurrent()
                })
            },
            {
                name: 'Payment Information',
                view: new PaymentInformation.PaymentInformationView({
                    model: PaymentInformation.PaymentInformationModel.fromCurrent()
                })
            },
            {
                name: 'Custom Attributes',
                view: new CustomAttributes.CustomAttributesView({
                    model: CustomerModels.EditableCustomer.fromCurrent()
                })
            }
        ]
    });

    $(document).ready(function () {
      // Orders, Returns, and Lists grids all have user IDs but need first and last names.
      // This call is gluttonous and should be replaced with a call to users with filter params for
      // the user IDs we need.
      var b2bAccount = new B2BAccountModels.b2bAccount({id: require.mozuData('user').accountId});
      return b2bAccount.apiGetUsers().then(function(users){
          var strippedDownUsers = _.map(users.data.items, function(user){
             return {
                 firstName: user.firstName,
                 lastName: user.lastName,
                 userId: user.userId
             };
          });

          window.b2bUsers = strippedDownUsers;
          var views = {
              paneSwitcherView: new PaneSwitcher.PaneSwitcherView({
                  templateName: "modules/b2b-account/pane-switcher",
                  el: $('.mz-b2b-pane-switcher'),
                  model: paneSwitcherModel
              })
          };
          window.views = views;
          _.invoke(views, 'render');
      });

    });
});
