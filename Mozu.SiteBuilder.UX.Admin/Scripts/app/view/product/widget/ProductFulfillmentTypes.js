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
    columns: 3,
    product: null,
    isReadOnly: false,
    allowBlank: false,

    initComponent: function () {
        var me = this,
            fulfillmentTypes = this.product.get("fulfillmentTypesSupported");

        me.record = this.product;

        this.directShipCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'Direct Ship',
            name: 'directShipCb',
            inputValue: 'DirectShip',
            checked: (fulfillmentTypes.indexOf('DirectShip') != -1),
            readOnly: this.isReadOnly,
            handler: (this.isReadOnly) ? '' : me.onFulfillmentChange,
            scope: me,
            fulfillmentType: 1
        });

        this.inStorePickupCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'In Store Pickup',
            name: 'inStoreCb',
            inputValue: 'InStorePickup',
            checked: (fulfillmentTypes.indexOf('InStorePickup') != -1),
            readOnly: this.isReadOnly,
            handler: (this.isReadOnly) ? '' : me.onFulfillmentChange,
            scope: me,
            fulfillmentType: 1
        });

        this.digitalGiftCardCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'Gift Card',
            name: 'digitalGiftCardCb',
            inputValue: 'DigitalGiftCard',
            checked: (fulfillmentTypes.indexOf('DigitalGiftCard') != -1),
            readOnly: this.isReadOnly,
            handler: (this.isReadOnly) ? '' : me.onFulfillmentChange,
            scope: me,
            fulfillmentType: 1
        });

        this.items = [
            this.directShipCheckbox,
            this.inStorePickupCheckbox,
            this.digitalGiftCardCheckbox
        ];

        this.callParent(arguments);

    },
    
    onFulfillmentChange: function () {
        var me = this,
            fulfillmentTypeValue = [];

        if (me.directShipCheckbox.getValue())
            fulfillmentTypeValue.push(me.directShipCheckbox.inputValue);

        if (me.inStorePickupCheckbox.getValue())
            fulfillmentTypeValue.push(me.inStorePickupCheckbox.inputValue);

        if (me.digitalGiftCardCheckbox.getValue())
            fulfillmentTypeValue.push(me.digitalGiftCardCheckbox.inputValue);

        me.record.set("fulfillmentTypesSupported", fulfillmentTypeValue);
    }

});
