/**
 * @class Taco.view.product.subform.Pricing
 * @author gm
 *
 */

Ext.define('Taco.view.product.subform.Pricing', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productpricingsubform',
    title: 'Pricing',
    requires: [
        'Taco.core.ux.form.CurrencyField',
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.picker.DateTime',
        'Taco.view.product.subform.OverrideForm',
        'Taco.view.product.subform.Bundle',
        'Taco.core.ux.form.Form',
        'Ext.data.Store',
        'Ext.form.field.Text'
    ],
    
    initComponent: function () {
        var me = this;
        this.record = this.product;

        this.defaults.width = '100%';
        this.defaults.product = this.product;
        this.defaults.productInCatalogInfo = this.productInCatalogInfo;
        this.defaults.persistChangesToModel = true;

        // remove for multi site;
        if (this.isGlobal || this.isSingleSite) {

            this.isTaxableField = {
                xtype: 'checkboxfield',
                name: 'isTaxable',
                boxLabel: 'Taxable'
            };
        }

        readOnly = this.isEdit() || !(this.isSingleSite || this.isGlobal);
        visable = !readOnly || this.isEdit();

        this.priceField = {
            xtype: 'numberfield',  //'currencyfield', //,
            fieldLabel: 'Price',
            name: 'price',
            anchor: '96%',
            //flex: 2,
            width: 200,
            forcePrecision: true,
            required: true,
            //cls: Taco.baseCSSPrefix + 'flex-field-spacing'
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: 'Enter price'
        };

        this.bundlePriceField = {
            xtype: "editabledisplayfield",
            itemId: "rollupBundlePrice",
            anchor: '96%',
            //flex: 2,
            //width: 250,
            //margin: "0 0 0 5",
            border: false,
            tpl: [
                "<tpl if='price'>",
                "<span>Total price of individual products</span><br/>",
                "<span class='taco-rolledup-price'>{price:usMoney}</span>",
                "</tpl>"
            ]
        };

        this.salePriceField = {
            xtype: 'numberfield',
            fieldLabel: 'Sale Price',
            name: 'salePrice',
            anchor: '96%',
            //flex: 2,
            //width: 200,
            forcePrecision: true,
            //cls: Taco.baseCSSPrefix + 'flex-field-spacing'
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: '$10.00'
        };

        this.bundleSalePriceField = {
            xtype: "editabledisplayfield",
            itemId: "rollupBundleSalePrice",
            anchor: '96%',
            //margin: "0 0 0 5",
            border: false,
            tpl: [
                "<tpl if='price'>",
                "<span>Total sale price of individual products</span><br/>",
                "<span class='taco-rolledup-price'>{price:usMoney}</span>",
                "</tpl>"
            ]
        };

        this.msrpField = {
            xtype: 'numberfield',
            fieldLabel: 'MSRP',
            name: 'msrp',
            anchor: '96%',
            forcePrecision: true,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: "Manufacturer's Suggested Retail Price"
        };

        this.costField = {
            xtype: 'numberfield',  //'currencyfield', //,
            fieldLabel: 'Cost',
            name: 'cost',
            anchor: '96%',
            width: 200,
            forcePrecision: true,
            required: false,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: ''
        };

        this.mapField = {
            xtype: 'numberfield',  //'currencyfield', //,
            fieldLabel: 'Minimum Advertised Price',
            name: 'map',
            anchor: '96%',
            width: 200,
            forcePrecision: true,
            required: false,
            hideTrigger: true,
            mouseWheelEnabled: false,
            selectOnFocus: true,
            emptyText: 'MAP'
        };

        this.mapStartField = {
            xtype: 'datetime',
            fieldLabel: 'Effective Date',
            name: 'mapStartDate',
            anchor: '96%',
            width: 200,
            emptyText: 'Start Date',
            pickerOffset: 4
        };

        this.mapEndField = {
            xtype: 'datetime',
            fieldLabel: 'End Date',
            name: 'mapEndDate',
            anchor: '96%',
            width: 200,
            emptyText: 'End Date',
            pickerOffset: 4
        };

        this.discountsRestrictedField = {
            xtype: 'checkboxfield',
            margin: '0 0 0 10',
            fieldLabel: 'Product Discounts',
            boxLabel: 'Restrict Discount on this product',
            name: 'discountsRestricted',
            anchor: '96%',
        };

        this.discountRestrictionStartField = {
            xtype: 'datetime',
            fieldLabel: 'Effective Date',
            name: 'discountRestrictionStartDate',
            anchor: '96%',
            width: 200,
            //emptyText: 'Start Date',
            pickerOffset: 4
        };

        this.discountRestrictionEndField = {
            xtype: 'datetime',
            fieldLabel: 'End Date',
            name: 'discountRestrictionEndDate',
            anchor: '96%',
            width: 200,
            //emptyText: 'End Date',
            pickerOffset: 4
        };


        this.items = [
            
            {
                xtype: 'productoverride',
                width: '100%',
                overrideFieldName: 'isPriceOverridden',
                hideOverride: this.isSingleSite,
                items: [
                    {
                        xtype: 'panel',
                        ui: 'subform-subform',
                        layout: {
                            type: 'column',
                            align: 'top'
                        },
                        fieldDefaults: {
                            labelAlign: 'top',
                            msgTarget: 'side'
                        },
                        width: '100%', //'600',
                        margin: '10 0 0',
                        items: [
                                    {
                                        xtype: 'container',
                                        columnWidth: .3,
                                        layout: 'anchor',
                                        items: [
                                            this.priceField,
                                            this.bundlePriceField,
                                            this.msrpField
                                        ]
                                    }, {
                                        xtype: 'container',
                                        columnWidth: .2,
                                        layout: 'anchor',
                                        items: [
                                            {
                                                xtype: 'tbspacer'
                                            },
                                            {
                                                xtype: 'tbspacer'
                                            },
                                            {
                                                xtype: 'tbspacer'
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        columnWidth: .3,
                                        layout: 'anchor',
                                        items: [
                                            this.salePriceField,
                                            this.bundleSalePriceField,
                                            this.costField
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        columnWidth: .2,
                                        layout: 'anchor',
                                        items: [
                                            this.isTaxableField
                                        ]
                                    }
                        ]
                    },
                    {
                        xtype: 'panel',
                        ui: 'subform-subform',
                        layout: {
                            type: 'hbox',
                            align: 'top'
                        },
                        fieldDefaults: {
                            labelAlign: 'top',
                            msgTarget: 'side'
                        },
                        width: '100%', //'600',
                        margin: '10 0 0',
                        items: [
                            {
                                xtype: 'container',
                                anchor: '100%',
                                layout: 'column',
                                items: [
                                    {
                                        xtype: 'container',
                                        columnWidth: .4,
                                        layout: 'anchor',
                                        items: [
                                            this.mapField
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        columnWidth: .2,
                                        layout: 'anchor',
                                        items: [
                                            this.mapStartField
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        columnWidth: .2,
                                        layout: 'anchor',
                                        items: [
                                            this.mapEndField
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'panel',
                        ui: 'subform-subform',
                        layout: {
                            type: 'hbox',
                            align: 'top'
                        },
                        fieldDefaults: {
                            labelAlign: 'top',
                            msgTarget: 'side'
                        },
                        width: '100%',
                        margin: '10 0 0',
                        items: [
                            {
                                xtype: 'container',
                                anchor: '100%',
                                layout: 'column',
                                items: [
                                    {
                                        xtype: 'container',
                                        columnWidth: .4,
                                        layout: 'anchor',
                                        items: [
                                            this.discountsRestrictedField
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        columnWidth: .2,
                                        layout: 'anchor',
                                        items: [
                                            this.discountRestrictionStartField
                                        ]
                                    },
                                    {
                                        xtype: 'container',
                                        columnWidth: .2,
                                        layout: 'anchor',
                                        items: [
                                            this.discountRestrictionEndField
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        this.items = Taco.core.util.Common.filterNulls(this.items);

        this.callParent(arguments);

        // listend for changes to the productUsage and bundleItem changes on the main form;
        me.on('afterrender', function () {
            var productForm = me.up("productform");
            me.mon(productForm, 'productusagechange', me.updatePriceUI, me);
            me.mon(productForm, 'bundleItemChange', me.updatePriceUI, me);

        }, me);


    },
    
    /**
    * when the productUsage changes, will need to alter the ux for price on the general form;
    */
    updatePriceUI: function () {
        var me = this,
            //productUsageValue = me.product.get("productUsage"),
            productUsageValue = me.record.get("productUsage"),
            rollupBundlePriceField = this.down('#rollupBundlePrice'),
            price = 0,
            rollupBundleSalePriceField = this.down('#rollupBundleSalePrice'),
            salePrice = 0,
            bundledProducts;

        // calculate the combined prices of each item
        if (productUsageValue == 'Bundle') {
            //store
            bundledProducts = this.record.getBundledProducts();

            bundledProducts.each(function (item) {
                price += item.data.price * item.data.quantity;

                if (item.data.salePrice) {
                    salePrice += item.data.salePrice * item.data.quantity;
                } else {
                    // no sale price for this item, use the full price
                    salePrice += item.data.price * item.data.quantity;
                }

            });
        }

        rollupBundlePriceField.setValue({
            price: price
        });


        rollupBundleSalePriceField.setValue({
            price: salePrice
        });

    },

    loadRecord: function (record) {
        var me = this;
        //console.log(record.get("price"));
        me.updatePriceUI(me, record.get("productUsage"));

        me.callParent(arguments);
    }

});