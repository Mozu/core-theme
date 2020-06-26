/**
 * @class Taco.view.product.widget.ProductBundleGrid
 */
Ext.define('Taco.view.product.widget.ProductFulfillmentTypes', {
    //extend: 'Ext.form.CheckboxGroup',
    extend: 'Ext.container.Container',
    alias: 'widget.productfulfillmenttypes',
    requires: [
        'Ext.data.Store',
        'Taco.store.Products'
    ],
    fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.fulfillment_types,
    layout: {
        type: "hbox"
    },
    //bodyPadding: 0,
    hidden: false,
    //columns: 3,
    product: null,
    isPhysical: true,
    isReadOnly: false,
    isBundleComponent: false,
    fulfillmentTypes: [],
    allowBlank: false,

    initComponent: function () {
        var me = this;
        me.record = this.product;

        this.directShipCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: Localizer.langResources.CATALOG.Products.ProductEdit.direct_ship,
            name: 'directShipCb',
            inputValue: 'DirectShip',
            checked: ((this.fulfillmentTypes.indexOf('DirectShip') != -1) && this.isPhysical),
            readOnly: this.isReadOnly,
            disabled: !this.isPhysical,
            handler: (this.isReadOnly) ? '' : me.updateFulfillmentRecord,
            scope: me,
            margin: '0 15 0 0',
            fulfillmentType: 1
        });

        this.inStorePickupCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: Localizer.langResources.CATALOG.Products.ProductEdit.in_store_pickup,
            name: 'inStoreCb',
            margin: '0 15 0 15',
            inputValue: 'InStorePickup',
            checked: ((this.fulfillmentTypes.indexOf('InStorePickup') != -1) && this.isPhysical),
            readOnly: this.isReadOnly,
            disabled: !this.isPhysical,
            handler: (this.isReadOnly) ? '' : me.updateFulfillmentRecord,
            scope: me,
            fulfillmentType: 1
        });

        this.digitalCreditCheckbox = Ext.widget({
            xtype: 'checkboxfield',
            boxLabel: Localizer.langResources.SHARED.email_text,
            name: 'digitalCreditCb',
            margin: '0 0 0 15',
            inputValue: 'Digital',
            checked: ((this.fulfillmentTypes.indexOf('Digital') != -1) || !this.isPhysical),
            readOnly: true,
            hidden: this.isPhysical,
            scope: me,
            fulfillmentType: 1
        });

        this.items = [
            this.directShipCheckbox,
            this.inStorePickupCheckbox,
            this.digitalCreditCheckbox
        ];

        this.callParent(arguments);
        if (! this.isBundleComponent) {
            this.updateFulfillmentRecord();
        }

    },

    updateFulfillmentRecord: function () {
        var me = this,
            fulfillmentTypeValue = [];

        if (me.directShipCheckbox.getValue())
            fulfillmentTypeValue.push(me.directShipCheckbox.inputValue);

        if (me.inStorePickupCheckbox.getValue())
            fulfillmentTypeValue.push(me.inStorePickupCheckbox.inputValue);

        if (me.digitalCreditCheckbox.getValue())
            fulfillmentTypeValue.push(me.digitalCreditCheckbox.inputValue);

        me.record.set("fulfillmentTypesSupported", fulfillmentTypeValue);
    }

});
