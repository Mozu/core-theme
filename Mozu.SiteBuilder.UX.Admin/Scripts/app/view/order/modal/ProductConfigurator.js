Ext.define('Taco.view.order.modal.ProductConfigurator', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.order.widget.ProductConfigurator'
    ],

    autoShow: true,
    closeAction: 'destroy',
    scale: 'large',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.configure_product,

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
        // for this base class we assume that the save is not delegated to the child components.
        // if the extensions of this class need to handle the save and want to wait for a successful service response,
        // they should override the onSave method with their own;
        var me = this;

        var callback = function(error) {
            if (error) {
                var errorMessage = error.message || Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.something_went_wrong;
                Taco.app.fireEvent("setmessage", errorMessage, "error");
                return;
            }

            if (me.form.runtimeData.PurchasableState.IsPurchasable) {
                var data = Ext.clone(me.form.getData())
                me.saveSuccess(data);
                return;
            }

            Ext.each(me.form.runtimeData.PurchasableState.Messages, function (msg) {
                Taco.app.fireEvent("setmessage", msg.Message, "error");
            });
        }

        this.form.postOptions(callback);
    },

    destroy: function () {
        this.form.destroy();
        this.callParent(arguments);
        this.form = null;
    }
});
