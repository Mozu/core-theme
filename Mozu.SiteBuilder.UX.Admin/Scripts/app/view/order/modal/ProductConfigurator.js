Ext.define('Taco.view.order.modal.ProductConfigurator', {
    extend: 'Taco.core.ux.window.WindowWithActions',

    requires: [
        'Taco.view.order.widget.ProductConfigurator'
    ],

    title: 'Configure Product',

    autoShow: true,

    productCode: null,
    record: null,

    initComponent: function () {
        this.addEvents(
            'configureproduct'
        );

        this.configurator = Ext.create('Taco.view.order.widget.ProductConfigurator', {
            productCode: this.productCode,
            record: this.record,
            listeners: {
                savablestatechange: this.onSavableStateChange,
                scope: this
            }
        });

        this.items = [this.configurator];

        this.on({
            save: this.onSave,
            scope: this
        });

        this.callParent(arguments);
    },

    onSavableStateChange: function (form, state) {
        console.log('STATE CHANGE', state);
        this.setSavable(state);
    },

    onSave: function () {
        this.fireEvent('configureproduct', this.configurator.getData());
        this.hide();
    }


});