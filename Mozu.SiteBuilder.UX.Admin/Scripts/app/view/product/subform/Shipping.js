/**
 * @class Taco.view.product.subform.Shipping
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Shipping', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productshippingsubform',
    title: 'Shipping',
    
    initComponent: function () {
        var me = this;
        
        this.record = this.product;
      this.items = [];

        
        // only allow field persistance if the productUsage is not bundle;
        this.isPersistable = (this.product.get("productUsage") != "Bundle");

        this.updateUI();

        this.callParent(arguments);

       me.on('afterrender', function () {
            var productForm = me.up("productform");
            me.mon(productForm, 'productusagechange', me.onProductUsageChange, me);
            // every change to the bundle items (add remove, quantity change) will cause a rerendering of the control
            me.mon(productForm, 'bundleItemChange', me.updateUI, me);
        });

        /*

        this.on('afterrender', function () {
            var weight = this.findField('packageWeight');
            if (!weight.getValue()) {
                weight.setValue(1);
                this.record.set('packageWeight', 1);
            }
        },this, {
            delay :100
        });
        */



    },
    
    updateUI: function () {
        if (this.rendered) {
            this.removeAll(true);
        } else {
            this.items = [];
        }
        
        var field;
        
        if (this.isPersistable) {
            field = this.getPersistableFields();
        } else {
            field = this.getBundleFields();
        }


        if (this.rendered) {
            this.add(field);
        } else {
            this.items.push(field);
        }
    },

    getFieldCollection: function (record,isBundle) {
        var me = this,
            packageWeight = record.get('packageWeight'),
            productNameField;
        
        isBundle = (isBundle == true);

        if (isBundle) {
            var productName = record.get("productName") + " (Qty " + record.get("quantity") + ")";

            productNameField = Ext.widget({
                xtype: 'editabledisplayfield',
                width: 200,
                border: false,
                value: productName,
                style: {
                    'margin-top': '41px',
                    'margin-right': '5px'
                },
                fieldLabel: ''
            });
        } else {

            var fulfillmentTypes = record.get("fulfillmentTypesSupported");

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
        }

        var field = {
            xtype: 'container',
            width: '100%',
            layout: 'hbox',
            items: [
                productNameField,
                {
                    xtype: 'unitfield',
                    name: (isBundle) ? "" : 'packageWeight',
                    width:200,
                    fieldLabel: 'Weight',
                    selectOnFocus: true,
                    emptyText: 'lbs',
                    unitString: ' lbs',
                    unitAtEnd: true,
                    decimalPrecision: 3,
                    minValue: .001,
                    hideTrigger: true,
                    value: record.get('packageWeight'),
                    keyNavEnabled: false,
                    readOnly: (isBundle),
                    allowBlank: (isBundle),
                    mouseWheelEnabled: false,
                    style: {
                        'margin-right': '20px'
                    }
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Package Dimensions',
                    labelClsExtra : 'x-form-item-required',
                    width: 480,
                    layout: {
                        type: 'hbox',
                        align: 'top'
                    },
                    defaults: {
                        width: 120,
                        margin: '0 0 0 10',
                        selectOnFocus: true,
                        xtype: 'unitfield',
                        unitString: ' in',
                        decimalPrecision: 3,
                        hideTrigger: true,
                        keyNavEnabled: false,
                        readOnly: (isBundle),
                        allowBlank: (isBundle),
                        mouseWheelEnabled: false
                    },
                    items: [
                        {
                            margin: 0,
                            name: (isBundle) ? "" : 'packageLength',
                            value: record.get('packageLength'),
                            emptyText: 'l'
                        }, {
                            name: (isBundle) ? "" : 'packageWidth',
                            value: record.get('packageWidth'),
                            emptyText: 'w'
                        }, {
                            name: (isBundle) ? "" : 'packageHeight',
                            value: record.get('packageHeight'),
                            emptyText: 'h'
                        }
                    ]
                }, {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Fulfillment Types',
                    flex: 2,
                    bodypadding: 10,
                    hidden: isBundle,
                    columns: 2,
                    items: [
                        this.directShipCheckbox,
                        this.inStorePickupCheckbox                        
                    ]
                }
            ]
        };
        
        // remove the productNameField if its null;
        field.items = Taco.core.util.Common.filterNulls(field.items);

        return Ext.widget(field);
    },

    getBundleFields: function () {
        
        var me =this,
            bundleContainer = {
                xtype: "container",
                width: "100%",
                itemId: "shippingBundleContainer",
                items: [{
                    xtype: "component",
                    html: "No bundle items selected"
                }]
            },
            store = me.product.getBundledProducts();
        
        if (store.count()) {
            // clear out the container;
            bundleContainer.items = [];
            var totalWeight = 0;
                
            // push a fieldset for each bundledProduct
            store.each(function (record) {
                var field =  me.getFieldCollection(record,true);
                bundleContainer.items.push(field);
                totalWeight += record.get("packageWeight") * record.get("quantity");
            });         
            

            bundleContainer.items.push({
                xtype: 'unitfield',
                width:200,
                unitString: ' lbs',
                unitAtEnd: true,
                hideTrigger: true,
                readOnly: true,
                margin: "0 0 0 205",
                fieldLabel: "Total Weight",
                value: totalWeight
            });
        }
        return bundleContainer;
    },

    getPersistableFields: function (config) {
        // if the productUsage is bundle need to show the fields for each product.
        return this.getFieldCollection(this.product);
    },

    onProductUsageChange: function(view, value) {
        if (value == "Bundle") {
            // only need to do this if we are changing from a persistable product to a bundle;
            if (this.isPersistable) {
                this.isPersistable = false;
                this.updateUI();
            }
        } else {
            // only need to do this if we are changing from a bundle to a persistable product;
            if (!this.isPersistable) {
                this.isPersistable = true;
                this.updateUI();
            }
        }
    },

    onFulfillmentChange: function () {
        var me = this;
        var fulfillmentTypeValue = [];
        var fulfillmentFields = me.query("[fulfillmentType]");
        Ext.Array.forEach(fulfillmentFields, function(field) {
            if (field.checked)
                fulfillmentTypeValue.push(field.inputValue);
        }, me);
        this.record.set("fulfillmentTypesSupported", fulfillmentTypeValue);
    }
});