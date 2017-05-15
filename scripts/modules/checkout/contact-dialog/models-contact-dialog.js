define(["backbone", 'hyprlive', 'modules/models-customer', 'modules/models-dialog' ], function(Backbone, Hypr, CustomerModels, Dialog) {

    var modalDialog = Dialog.extend({
        handlesMessages: true,
        relations : {
            destinationContact : CustomerModels.Contact
        },
        resetDestinationContact: function(){
            
    	   this.get('destinationContact').clear();
           this.set('destinationContact', new CustomerModels.Contact({address: {}}));

        }, 
        initialize: function () {
        	this.set('destinationContact', new CustomerModels.Contact({address: {}}));
        }
    });

    return modalDialog;
});
