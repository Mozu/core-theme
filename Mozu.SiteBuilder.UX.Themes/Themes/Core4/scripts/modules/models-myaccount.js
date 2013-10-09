define(
    ["modules/jquery-mozu", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-customer", "modules/models-user"],
    function ($, ko, ViewModelPrototype, CustomerModels, UserModels) {

        //function makeEventCannon(name) {
        //    return function () {
        //        return this.publish(name);
        //    }
        //}

        var MyAccount = ViewModelPrototype.extend({
            hasMessages: true,
            submodels: {
                User: UserModels.User,
                Customer: CustomerModels.Customer
            }
            /*
            ,
            beginEditEmail: makeEventCannon('begineditemail'),
            endEditEmail: makeEventCannon('endeditemail'),
            beginEditAddress: makeEventCannon('begineditaddress'),
            endEditAddress: makeEventCannon('endeditaddress')
            */
        }, function constructMyAccount() {
            
        });

        return {
            AccountModel: MyAccount
        }
    }
);
