define(["modules/jquery-mozu",
    "underscore",
    "modules/backbone-mozu",
    "modules/checkout/models-alternate-contact"],
    function ($, _, Backbone,AlternateContact) {

    var PickupView = Backbone.MozuView.extend({
        templateName: 'modules/multi-ship-checkout/pickup-contact',
        renderOnChange: [
            'isReady'
        ],
        render: function() {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this,arguments);
                setTimeout(self.renderChild.bind(self),1000);
        },
        renderChild: function() {
            var AlternateContactModel = this.model.get("alternateContact")||new AlternateContact();
            var alternatePickupContact= new AlternatePickupView({
                el:$('#alternate-contact'),
                model: AlternateContactModel
            });
            alternatePickupContact.render();
            alternatePickupContact.model.setOrder(this.model);
        }

    });

    var tempAlternateContactData;
    var AlternatePickupView =  Backbone.MozuView.extend({ //Backbone.MozuView
        templateName: 'modules/multi-ship-checkout/pickup-contact-alternate',
        autoUpdate: [
            'firstName',
            'lastNameOrSurname',
            'emailAddress',
            'phoneNumber'],
        additionalEvents: {
            "click [data-mz-action='addAlternateContact']": "addAlternateContact",
            "click [data-mz-action='deleteAlternateContact']": "deleteAlternateContact",
            "click [data-mz-action='editAlternateContact']":"editAlternateContact",
            "click [data-mz-action='saveAlternateContact']":"saveAlternateContact",
            "click [data-mz-action='cancelAlternateContact']":"cancelAlternateContact",
            "keyup input":"onKeyUpAlternate"
        },
        initialize:function(){
            var self = this;
            self.hideForm();
            $("#pickup-contact [data-mz-action='editAlternateContact']").on('click',function(e){
                self.editAlternateContact(e);
            });
        },
        render: function() {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this,arguments);
            setTimeout(function(){
                self.hideForm();
            },500);
        },
        saveAlternateContact: function () {
            var self = this;
            _.defer(function () {
                var successfull = self.model.submit();
                self.model.setFormOpen(false);
                if(successfull) {
                   self.render();
                }
            });

        },
        showForm: function() {
            $("#change-alternate-contact").hide();
            $("#pickup-display-section").hide();
            $("#add-alternate-contact").hide();
            $("#delete-alternate-contact").show();
            $("#pickup-form-section").show();
        },
        hideForm: function(e) {
            var firstName=this.model.get("firstName"),
            lastNameOrSurname = this.model.get("lastNameOrSurname"),
            emailAddress = this.model.get("emailAddress");
            if((!firstName||firstName==='')||(!lastNameOrSurname||lastNameOrSurname==='')||(!emailAddress||emailAddress==='')){
                $("#change-alternate-contact").hide();
                $("#delete-alternate-contact").hide();
                $("#pickup-form-section").hide();
                $("#pickup-display-section").show();
                $("#add-alternate-contact").show();
                } else {
                    $("#delete-alternate-contact").hide();
                    $("#pickup-form-section").hide();
                    $("#add-alternate-contact").hide();
                    $("#pickup-display-section").show();
                    $("#change-alternate-contact").show();
                }
        },
        addAlternateContact: function(e) {
            e.preventDefault();
            this.model.setFormOpen(true);
            tempAlternateContactData = {};
            this.showForm();
        },
        deleteAlternateContact:function(e) {
            e.preventDefault();
            this.model.setFormOpen(false);
            tempAlternateContactData = {};
            this.model.set("firstName",null);
            this.model.set("lastNameOrSurname",null);
            this.model.set("emailAddress",null);
            this.model.set("phoneNumber",null);
            this.model.deleteAlternateContact();
            this.render();
        },
        editAlternateContact: function(e) {
            e.preventDefault();
            this.model.setFormOpen(true);
            tempAlternateContactData = _.clone(this.model.attributes);
            this.showForm();
        },
        cancelAlternateContact: function(e) {
            this.model.setFormOpen(false);
            if(tempAlternateContactData) {
                this.model.attributes = _.clone(tempAlternateContactData);
                this.render();
            }
            else {
                this.hideForm();
            }

        }
    });

    return PickupView;
});
