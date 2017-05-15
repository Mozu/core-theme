define(['modules/jquery-mozu','underscore',"modules/backbone-mozu",'hyprlive', 'modules/modal-dialog'], function($, _, Backbone, Hypr, Dialog) {
    var ModalDialog = Backbone.MozuView.extend({
            templateName: 'modules/common/modal-dialog',
            initialize: function() {
                var self = this;
                
                self.listenTo(this.model, 'openDialog', function () {
                    self.handleDialogOpen();
                });
                self.listenTo(this.model, 'saveDialog', function () {
                    self.handleDialogSave();
                });
                self.listenTo(this.model, 'closeDialog', function () {
                    self.handleDialogClose();
                });
                self.listenTo(this.model, 'cancelDialog', function () {
                    self.handleDialogCancel();
                });

                this.initDialog(); 
            },
            initDialog: function(){
                if(!this.bootstrapInstance){
                    this.bootstrapInstance = Dialog.init({
                        elementId: "mzModalDialog"
                    });
                }
            },
            handleDialogSave: function(){
                this.model.trigger('dialogSave');
                this.handleDialogClose();
            },
            handleDialogClose: function(){
                this.model.trigger('dialogClose');
                this.bootstrapInstance.hide();
            },
            handleDialogOpen: function(){
                this.model.trigger('dialogOpen');
                this.bootstrapInstance.show();
            },
            handleDialogCancel: function(){
                this.model.trigger('dialogCancel');
                this.handleDialogClose();  
            },
            render: function() {
                var self = this;
                Backbone.MozuView.prototype.render.apply(this, arguments);
            }
        });
    return ModalDialog;

});