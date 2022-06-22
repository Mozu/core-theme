define([
    'underscore',
    'hyprlive',
    'modules/backbone-mozu'
],
function (_, Hypr, Backbone) { 

var formOpen = false;

var AlternateContact = Backbone.MozuModel.extend({
    validation: {
        'firstName': {
            fn: "validateFirstName"
        },
        'lastNameOrSurname': {
            fn: "validateLastNameOrSurname"
        },
        'emailAddress': {
            fn: 'validateEmailAddress'
        }
    },
    setOrder: function(order) {
        this.parent = order;
    },
    getOrder: function() {
        return this.parent;
    },
    setFormOpen:function(flag){
    formOpen=flag;
    },
    submit: function() {
        
        var order = this.getOrder();

        var val = this.validate();

        if (val) {
            // display errors:
            var error = {"items":[]};
            for (var key in val) {
                if (val.hasOwnProperty(key)) {
                    var errorItem = {};
                    errorItem.name = key;
                    errorItem.message = key.substring(0, ".") + val[key];
                    error.items.push(errorItem);
                }
            }
            if (error.items.length > 0) {
                order.onCheckoutError(error);
            }
            return false;
        }
        order.set('alternateContact',this);
        order.messages.reset();
        return true;
    },
    deleteAlternateContact:function(){
        var order = this.getOrder();
        order.unset('alternateContact');
    },
    validateFirstName: function(value, attr) {
        if(!formOpen) {
            return undefined;
        }
        if(!value) {
            return Hypr.getLabel("firstNameMissing");
        }
    },
    validateLastNameOrSurname: function(value, attr) {
        if(!formOpen) {
            return undefined;
        }
        if(!value) {
            return Hypr.getLabel("lastNameMissing");
        }
    },
    validateEmailAddress: function(value, attr) {
        if(!formOpen) {
            return undefined;
        }
        if(!value) {
            return Hypr.getLabel("emailMissing");
        }
        var emailPattern = Backbone.Validation.patterns.email;
        
        if (!value.toString().match(emailPattern)) {
            return Hypr.getLabel("emailMissing");
        }
    }
});

return AlternateContact;

});