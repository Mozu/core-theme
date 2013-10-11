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

        this.on({
            save: {
                scope: this,
                fn: 'save'
            }
        });
    },

    save: function () {
        this.fireEvent('configureproduct', this.form.getData());
    }
});
