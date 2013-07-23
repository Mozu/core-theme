Ext.define('Taco.view.order.modal.ProductConfigurator', {
    extend: 'Taco.core.ux.window.WindowWithActions',

    requires: [
        'Taco.view.order.widget.ProductConfigurator'
    ],

    title: 'Configure Product',

    autoShow: true,

    initComponent: function () {
        this.configurator = Ext.create('Taco.view.order.widget.ProductConfigurator', {
            productCode: 'pants-cords'
        });

        this.items = [this.configurator];

        this.callParent(arguments);
    }
});