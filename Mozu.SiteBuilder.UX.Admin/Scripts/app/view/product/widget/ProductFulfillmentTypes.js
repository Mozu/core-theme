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
            fulfillmentTypes = this.product.get("fulfillmentTypesSupported"),
            isPhysicalGood = true;

        me.record = this.product;
        if (this.productType) {
            isPhysicalGood = (this.productType.get('goodsType') === 'Physical');
        }

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

        me.on('afterrender', function () {
            //hook up listeners
            me.mon(Taco.app, 'producttypechanged', me.onProductTypeChange, me);
        });

        this.callParent(arguments);

    },

    onProductTypeChange: function (productTypeRecord) {
        goodsType = productTypeRecord.get("goodsType");

        if (goodsType === 'DigitalGiftCard') {
            this.directShipCheckbox.setValue(false);
            this.directShipCheckbox.disable();

            this.inStorePickupCheckbox.setValue(false);
            this.inStorePickupCheckbox.disable();

            this.digitalGiftCardCheckbox.show();
            this.digitalGiftCardCheckbox.enable();
            this.digitalGiftCardCheckbox.setValue(true);
        } else {
            this.digitalGiftCardCheckbox.hide();
            this.digitalGiftCardCheckbox.setValue(false);

            this.directShipCheckbox.enable();
            this.inStorePickupCheckbox.enable();
        }
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
