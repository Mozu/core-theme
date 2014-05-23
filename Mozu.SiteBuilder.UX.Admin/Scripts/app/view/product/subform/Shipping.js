/**
 * @class Taco.view.product.subform.Shipping
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Shipping', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.view.product.widget.ProductFulfillmentTypes'
    ],
    alias: 'widget.productshippingsubform',
    title: 'Shipping',
    
    initComponent: function () {
        var me = this;
        
        this.record = this.product;

        me.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');
        var productTypeId = this.record.get('productTypeId');
        if (productTypeId) {
            me.productType = me.productTypeStore.getById(productTypeId);
        }

        this.items = [];

        //todo: create a bundle & a standard widget to reduce if/then complexity - Greg Murray on 2014-03-26 
        // only allow field persistance if the productUsage is not bundle;
        this.isNotBundle = (this.product.get("productUsage") != "Bundle");

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
        
        if (this.isNotBundle) {
            field = this.getFieldCollection(this.product, false); //this.getNonBundleFields();
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
            fulfillmentContainer,
            field;
        
        isBundle = (isBundle == true);

        var packageFields = this.getPackageFields(record, isBundle);

        fulfillmentContainer = Ext.create('Taco.view.product.widget.ProductFulfillmentTypes', {
            product: me.record,
            productType: me.productType,
            isReadOnly: isBundle,
            allowBlank: isBundle
        });

        if (isBundle) {
            var productName = record.get("productName") + " (Qty " + record.get("quantity") + ")";

            var productNameField = Ext.widget({
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
            field = {
                xtype: 'container',
                width: '100%',
                layout: 'hbox',
                items: [
                    productNameField
                ]
            };
            packageFields.forEach(function(pkg) {
                field.items.push(pkg);
            });
            field.items.push(fulfillmentContainer);

        } else {
            field = {
                xtype: 'container',
                width: '100%',
                items: [
                    fulfillmentContainer,
                    {
                        xtype: 'container',
                        width: '100%',
                        layout: 'hbox',
                        items: packageFields
                    }
                ]
            };
        }

        // remove the productNameField if its null;
        field.items = Taco.core.util.Common.filterNulls(field.items);

        return Ext.widget(field);
    },

    getPackageFields: function (record, isBundle) {
        return [
            {
                xtype: 'unitfield',
                name: (isBundle) ? "" : 'packageWeight',
                width: 200,
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
                labelClsExtra: 'x-form-item-required',
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
            }
        ];
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

            var fulfillment = Ext.create('Taco.view.product.widget.ProductFulfillmentTypes', {
                product: me.product
            });

            bundleContainer.items = [fulfillment];
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

    onProductUsageChange: function(view, value) {
        if (value == "Bundle") {
            // only need to do this if we are changing from a persistable product to a bundle;
            if (this.isNotBundle) {
                this.isNotBundle = false;
                this.updateUI();
            }
        } else {
            // only need to do this if we are changing from a bundle to a persistable product;
            if (!this.isNotBundle) {
                this.isNotBundle = true;
                this.updateUI();
            }
        }
    }

});