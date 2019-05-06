/*
Determines whether the Quick Order link should be visible.
This is based on user.behaviors - the user must have behavior 1008 (ability to place orders)
as well as NOT have behavior 1014 (a global-permission behavior we only give to B2C customers)
We SHOULD be able to achieve this by using the Hyper 'find' filter on the array of behaviors.
We can't though. I don't know why. This is the alternative, to avoid keeping a bunch of logic
in the template.
*/

define(['modules/jquery-mozu', 'modules/api', 'hyprlive', 'modules/mozu-utilities'], function ($, api, Hypr, MozuUtilities) {
    var user = require.mozuData('user'),
        behaviors = user.behaviors,
        label = Hypr.getLabel('quickOrder');

        var isB2CAccount = MozuUtilities.Behaviors.User_Has_Full_Access_To_Their_Account;
        var canPlaceOrders = MozuUtilities.Behaviors.Place_Orders;

        if (!behaviors.includes(isB2CAccount) && behaviors.includes(canPlaceOrders)){
            $('[data-mz-role="quickOrderLink"]').text(label);
        }

});
