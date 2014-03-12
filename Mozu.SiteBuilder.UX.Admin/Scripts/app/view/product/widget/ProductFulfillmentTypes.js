/**
 * @class Taco.view.product.widget.ProductBundleGrid
 */
Ext.define('Taco.view.product.widget.ProductFulfillmentTypes', {
    extend: 'Ext.form.CheckboxGroup',
    alias: 'widget.productfulfillmenttypes',
    requires: [
        'Ext.data.Store',
        'Taco.store.Products'
    ],
    fieldLabel: 'Fulfillment Types',
    flex: 2,
    bodypadding: 10,
    hidden: false,
    columns: 2,
    product: null,

    initComponent: function () {
        var me = this;

        this.record = this.product;

        var fulfillmentTypes = this.record.get("fulfillmentTypesSupported");

        var hasDirectShip = (fulfillmentTypes.indexOf('DirectShip') != -1);
        var hasInStore = (fulfillmentTypes.indexOf('InStorePickup') != -1);

        this.directShipCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'Direct Ship',
            name: 'directShipCb',
            inputValue: 'DirectShip',
            checked: hasDirectShip,
            handler: me.onFulfillmentChange,
            scope: me,
            fulfillmentType: 1
        });

        this.inStorePickupCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'In Store Pickup',
            name: 'inStoreCb',
            inputValue: 'InStorePickup',
            checked: hasInStore,
            handler: me.onFulfillmentChange,
            scope: me,
            fulfillmentType: 1
        });

        this.items = [
            this.directShipCheckbox,
            this.inStorePickupCheckbox
        ];

        this.callParent(arguments);

    },
    
    onFulfillmentChange: function () {
        var me = this;
        var fulfillmentTypeValue = [];

        if (me.directShipCheckbox.getValue())
            fulfillmentTypeValue.push(me.directShipCheckbox.inputValue);

        if (me.inStorePickupCheckbox.getValue())
            fulfillmentTypeValue.push(me.inStorePickupCheckbox.inputValue);

        me.record.set("fulfillmentTypesSupported", fulfillmentTypeValue);
    }

});
