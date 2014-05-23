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
    //listeners: {
    //    onProductTypeChange : function(selectField, value) {
    //        var me = this,
    //            productTypeRecord = selectField.store.getById(value),
    //            goodsType = productTypeRecord.get("goodsType");

    //        if (goodsType === 'DigitalGiftCard') {
    //            this.directShipCheckbox.setDisabled(true);
    //            this.inStorePickupCheckbox.setDisabled(true);
    //            this.digitalGiftCardCheckbox.show();
    //            this.digitalGiftCardCheckbox.setValue(true);
    //            this.digitalGiftCardCheckbox.setReadOnly();
    //        }

    //    }
    //},

    initComponent: function () {
        var me = this,
            fulfillmentTypes = this.product.get("fulfillmentTypesSupported");

        me.record = this.product;
        me.productTypeRecord = this.productType;
        var isPhysicalGood = (this.productType.get('goodsType') === 'Physical');

        this.directShipCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'Direct Ship',
            name: 'directShipCb',
            inputValue: 'DirectShip',
            checked: ((fulfillmentTypes.indexOf('DirectShip') != -1) && isPhysicalGood),
            readOnly: this.isReadOnly,
            hidden: ! isPhysicalGood,
            handler: (this.isReadOnly) ? '' : me.onFulfillmentChange,
            scope: me,
            fulfillmentType: 1
        });

        this.inStorePickupCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'In Store Pickup',
            name: 'inStoreCb',
            inputValue: 'InStorePickup',
            checked: ((fulfillmentTypes.indexOf('InStorePickup') != -1) && isPhysicalGood),
            readOnly: this.isReadOnly,
            hidden: !isPhysicalGood,
            handler: (this.isReadOnly) ? '' : me.onFulfillmentChange,
            scope: me,
            fulfillmentType: 1
        });

        this.digitalGiftCardCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: 'Email',
            name: 'digitalGiftCardCb',
            inputValue: 'Digital',
            checked: ((fulfillmentTypes.indexOf('Digital') != -1) || !isPhysicalGood),
            readOnly: true,
            disabled: true,
            hidden: isPhysicalGood,
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
