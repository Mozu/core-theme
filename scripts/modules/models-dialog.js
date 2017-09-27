define(["modules/backbone-mozu", 'hyprlive'], function(Backbone, Hypr) {

    var modalDialog = Backbone.MozuModel.extend({
        
        closeDialog: function(){
            this.trigger('closeDialog');
        },
        openDialog: function(){
            this.trigger('openDialog');
        },
        saveDialog: function(){
            this.trigger('saveDialog');
        }
    });
    return modalDialog;
});
