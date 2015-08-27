Ext.define('Taco.view.order.modal.ProductConfigurator', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.order.widget.ProductConfigurator'
    ],

    autoShow: true,
    closeAction: 'destroy',
    scale: 'large',
    title: 'Configure Product',

    productCode: null,
    record: null,

    initComponent: function() {
        this.addEvents(
            'configureproduct'
        );

        this.form = Ext.create('Taco.view.order.widget.ProductConfigurator', {
            productCode: this.productCode,
            record: this.record
        });

        this.items = [this.form];

        this.callParent(arguments);
    },
    

    /*
    * overriding the onSave method of the base class to pass custom arguments to the savesuccess;
    */
    doSave: function () {
        var data = Ext.clone(this.form.getData())
        // for this base class we assume that the save is not delegated to the child components.
        // if the extensions of this class need to handle the save and want to wait for a successful service response,
        // they should override the onSave method with their own;
        this.saveSuccess(data);
    },

    destroy: function () {
        this.form.destroy();        
        this.callParent(arguments);        
        this.form = null;
    }
});
