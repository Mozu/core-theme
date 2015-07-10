
/**
 * @class Taco.view.pendingChange.publishSet.PublishSetEditor.js
 */

Ext.define('Taco.view.pendingChange.publishSet.PublishSetEditModal', {
    extend: 'Taco.core.ux.editor.ModalEditor',
    requires: [
        'Taco.model.PublishSet',
        'Taco.model.Discount',
        'Taco.model.Product'
    ],

    modelName: 'Taco.model.Product',

    editCls: 'Taco.view.product.Edit',

    entityId: "009-8",

    record: null,

    initComponent: function(eOpts) {
        var me = this;

        this.callParent(arguments);
    },

    // reloads the ui using new data
    updateUi: function() {
        var me = this;

        this.editView = Ext.create(me.editCls, {
            isModalWrapper:true,
            showIndexOnCancel: false,
            showIndexOnDestroy: false,
            enableWindowCloseButton:true,
            record: me.record,
            saveButtonVisible: true,
            cancelButtonVisible:true
        });

        this.mon(this.editView, 'aftersave', this.onAfterSave,this);

        this.add(this.editView);
    },

    onAfterSave : function() {
        //debugger;
        this.close();
    },

    doSave: function () {
        var me = this;
        
        // tell the editorForm to save and listen for the call back to close;

        this.editView.save();
        //this.fireEvent('aftersave', this, this.record, this.isEdit());


        
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
