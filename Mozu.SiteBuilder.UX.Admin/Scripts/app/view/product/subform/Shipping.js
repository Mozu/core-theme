/**
 * @class Taco.view.product.subform.Shipping
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Shipping', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.view.product.widget.ProductFulfillmentTypes',
         'Taco.core.ux.form.UnitField'
    ],
    alias: 'widget.productshippingsubform',
    title: 'Shipping',
    
    bodyPadding:"19 0 0 0",

    initComponent: function () {
        var me = this;
        
        this.record = this.product;

        //me.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');
        var productTypeId = this.record.get('productTypeId');
        if (productTypeId) {
            //me.productType = me.productTypeStore.getById(productTypeId);
            me.productType = me.product.productTypeRecord;
        }

        this.items = [];

        // todo: create a bundle & a standard widget to reduce if/then complexity - Greg Murray on 2014-03-26
        // only allow field persistance if the productUsage is not bundle;
        this.isNotBundle = (this.product.get("productUsage") != "Bundle");

        this.updateUI();

        this.callParent(arguments);

        me.on('afterrender', function () {
            var productForm = me.up("productform");
            me.mon(productForm, 'productusagechange', me.onProductUsageChange, me);
            // every change to the bundle items (add remove, quantity change) will cause a rerendering of the control
            me.mon(productForm, 'bundleItemChange', me.updateUI, me);
            me.mon(Taco.app, 'producttypechanged', me.onProductTypeChange, me);
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

    getFieldCollection: function (record) {
        var me = this,
            fulfillmentContainer,
            field,
            isPhysical = (!me.productType || me.productType.get('goodsType') === 'Physical'),
            fulfillmentTypes = (isPhysical ? me.product.get('fulfillmentTypesSupported') : ['Digital']),
            packageFields = this.getPackageFields(record, false, isPhysical);

        fulfillmentContainer = Ext.create('Taco.view.product.widget.ProductFulfillmentTypes', {
            product: me.record,
            fulfillmentTypes: fulfillmentTypes,
            isPhysical: isPhysical,
            isReadOnly: false,
            allowBlank: false
        });


        field = {
            xtype: 'container',
            width: '100%',
            items: [
                fulfillmentContainer
            ]
        };

        var isBundle = this.record.productUsage == "Bundle";
        if (!isBundle && isPhysical) {
            field.items.push({
                xtype: 'checkboxfield',
                name: 'isPackagedStandAlone',
                width: 120,
                margin:"10 0 0 0",
                boxLabel: 'Ships by itself',
                inputValue: true,
                checked: record.get("isPackagedStandAlone")
            })
        }

        field.items.push({
            xtype: 'container',
            width: '100%',
            layout: 'hbox',
            items: packageFields
        })
        

        // remove the productNameField if its null;
        field.items = Taco.core.util.Common.filterNulls(field.items);

        return Ext.widget(field);
    },

    getBundleFieldCollection: function (record) {
        var me = this,
            fulfillmentContainer,
            field,
            fulfillTypes = record.get('fulfillmentTypesSupported'),
            isPhysicalFulfillmentType = (!fulfillTypes ? true : fulfillTypes.indexOf('Digital') == -1),
            packageFields = this.getPackageFields(record, true, isPhysicalFulfillmentType);

        fulfillmentContainer = Ext.create('Taco.view.product.widget.ProductFulfillmentTypes', {
            product: me.record,
            fulfillmentTypes: fulfillTypes,
            isPhysical: isPhysicalFulfillmentType,
            isReadOnly: true,
            allowBlank: true,
            isBundleComponent: true
        });

        var productName = record.get("productName") + " (Qty " + record.get("quantity") + ")";

        var productNameField = Ext.widget({
            xtype: 'editabledisplayfield',
            width: 240,            
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

        // remove the productNameField if its null;
        field.items = Taco.core.util.Common.filterNulls(field.items);

        return Ext.widget(field);
    },

    getPackageFields: function (record, isBundle, isPhysical) {
        var packages = [
            {
                xtype: 'unitfield',
                name: (isBundle) ? "" : 'packageWeight',
                width: 120,
                fieldLabel: 'Weight',
                selectOnFocus: true,
                emptyText: 'lbs',
                unitString: ' lbs',
                unitAtEnd: true,
                decimalPrecision: 3,
                minValue: (isPhysical ? .001 : 0),
                hideTrigger: true,
                value: (isPhysical ? record.get('packageWeight') : '0 lbs'),
                keyNavEnabled: false,
                disabled: !isPhysical,
                readOnly: (isBundle),
                allowBlank: (isBundle),
                mouseWheelEnabled: false,
                style: {
                    'margin-right': '20px'
                }
            }, {
                xtype: 'fieldcontainer',
                //fieldLabel: 'Package Dimensions',
                labelClsExtra: '',
                disabled: (!isPhysical),
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
                    disabled: (! isPhysical),
                    readOnly: (isBundle),
                    allowBlank: (isBundle),
                    mouseWheelEnabled: false
                },
                items: [
                    {
                        margin: 0,
                        fieldLabel:"Length",
                        name: (isBundle) ? "" : 'packageLength',
                        value:  (isPhysical ? record.get('packageLength') : '0 in'),
                        emptyText: 'l'
                    }, {
                        name: (isBundle) ? "" : 'packageWidth',
                        fieldLabel: "Width",
                        value: (isPhysical ? record.get('packageWidth') : '0 in'),
                        emptyText: 'w'
                    }, {
                        name: (isBundle) ? "" : 'packageHeight',
                        fieldLabel: "Height",
                        value: (isPhysical ? record.get('packageHeight') : '0 in'),
                        emptyText: 'h'
                    }
                ]
            }
        ];
        if (! isPhysical) {
            record.set('packageWeight', 0);
            record.set('packageLength', 0);
            record.set('packageWidth', 0);
            record.set('packageHeight', 0);
        }
        return packages;
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
            store = me.product.getBundledProducts(),
            isPhysicalGood = (!me.productType || me.productType.get('goodsType') === 'Physical'),
            fulfillType = (isPhysicalGood ? me.product.get('fulfillmentTypesSupported') : ['Digital']);

        if (store.count()) {
            // clear out the container;

            var fulfillment = Ext.create('Taco.view.product.widget.ProductFulfillmentTypes', {
                product: me.product,
                isPhysical: isPhysicalGood,
                fulfillmentTypes: fulfillType,
                productType: me.productType
            });

            bundleContainer.items = [fulfillment];
            var totalWeight = 0;
                
            // push a fieldset for each bundledProduct
            store.each(function (record) {
                var field =  me.getBundleFieldCollection(record);
                bundleContainer.items.push(field);
                totalWeight += record.get("packageWeight") * record.get("quantity");
            });         
            

            bundleContainer.items.push({
                xtype: 'unitfield',
                width:120,
                unitString: ' lbs',
                unitAtEnd: true,
                hideTrigger: true,
                readOnly: true,
                margin: "0 0 0 245",
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
    },
    
    onProductTypeChange: function (productTypeRecord) {
        var me = this,
            isPhysicalPrevious = (!me.productType || me.productType.get('goodsType') === 'Physical'),
            isPhysicalNew = (!productTypeRecord || productTypeRecord.get('goodsType') === 'Physical');  
        me.productType = productTypeRecord;

        if (isPhysicalPrevious != isPhysicalNew) {
            this.updateUI();
        }
    }

});