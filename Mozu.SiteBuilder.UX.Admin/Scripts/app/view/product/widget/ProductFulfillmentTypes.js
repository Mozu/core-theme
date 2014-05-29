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
    bodyPadding: 10,
    hidden: false,
    columns: 3,
    product: null,
    isReadOnly: false,
    allowBlank: false,
    productType: null,
   
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
            disabled: !isPhysicalGood,
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
            disabled: !isPhysicalGood,
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
        var goodsType = productTypeRecord.get("goodsType");

        if (goodsType != 'Physical') {
            this.disableCheckbox(this.directShipCheckbox);
            this.disableCheckbox(this.inStorePickupCheckbox);

            this.digitalGiftCardCheckbox.suspendEvents();
            this.digitalGiftCardCheckbox.show();
            this.digitalGiftCardCheckbox.enable();
            this.digitalGiftCardCheckbox.setValue(true);
            this.digitalGiftCardCheckbox.resumeEvents();

        } else {
            this.digitalGiftCardCheckbox.suspendEvents();
            this.digitalGiftCardCheckbox.hide();
            this.digitalGiftCardCheckbox.setValue(false);
            this.digitalGiftCardCheckbox.resumeEvents();

            this.directShipCheckbox.enable();
            this.inStorePickupCheckbox.enable();
        }
        this.onFulfillmentChange();
    },

    disableCheckbox: function(cb) {
        cb.suspendEvents();
        cb.setValue(false);
        cb.disable();
        cb.resumeEvents();
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
