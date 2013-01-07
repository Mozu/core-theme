/**
* @author Travis Johnson
* @class Taco.view.product.edit.Basic
*/

Ext.define('Taco.view.product.edit.Basic', {
    requires: ['Taco.core.ux.MultiImageField',
        'Ext.data.ArrayStore',
        'Ext.form.field.HtmlEditor', 'Taco.store.Categories', 'Taco.store.Discounts', 'Taco.view.image.Uploader', 'Ext.util.Format', 'Taco.core.ux.modal.Content', 'Taco.view.product.edit.Categories', 'Taco.core.ux.modal.ContentWithActions', 'Taco.core.ux.form.UnitField', 'Taco.core.ux.form.CurrencyField', 'Taco.core.ux.form.FlexBox'],
    extend: 'Taco.core.ux.form.Module',

    model: 'Taco.model.Product',
    bubbleEvents: ['inventorycontrolchange'],

    form: {
        width: 720,
        layout: { type: 'vbox', align: 'stretch' },
        defaults: { xtype: 'formflexbox' },
        items: [{
            defaults: {
                xtype: 'container'
            },
            items: [{
                items: [{
                    xtype: 'multiimagefield',
                    name: 'productImages',
                    border: true,
                    width: 290
                }]
            }, {
                flex: 1,
                items: [{
                    xtype: 'container',
                    defaults: {
                        xtype: 'formflexbox'
                    },
                    items: [{
                        defaults: {
                            xtype: 'textfield',
                            labelAlign: 'top',
                            labelSeparator: '',
                            width: 430
                        },
                        items: [{
                            // xtype: 'textarea',
                            name: 'productName',
                            fieldCls: Taco.baseCSSPrefix + 'form-text-xlarge',
                            fieldLabel: 'Product Name'
                            // grow: true,
                            // growMin: 48,
                            // growMax: 84,
                            // maskRe: /./,
                            // stripCharsRe: /[\n\r\u2028\u2029]/
                        }]
                    }, {
                        defaults: {
                            xtype: 'unitfield',
                            labelAlign: 'top',
                            labelSeparator: '',
                            width: 110
                        },
                        items: [{
                            xtype: 'currencyfield',
                            name: 'price',
                            fieldLabel: 'Price',
                            minValue: 0,
                            decimalPrecision: 2,
                            hideTrigger: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false
                        }, {
                            xtype: 'currencyfield',
                            name: 'salePrice',
                            fieldLabel: 'Sale Price',
                            minValue: 0,
                            decimalPrecision: 2,
                            hideTrigger: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false
                        }, {
                            xtype: 'selectfield',
                            name: 'isActive',
                            fieldLabel: 'Status',
                            mode: 'local',
                            colspan: 1,
                            valueField: 'storedValue',
                            displayField: 'displayValue',
                            store: Ext.create('Ext.data.ArrayStore', {
                                fields: [{
                                    name: 'storedValue',
                                    type: 'boolean'
                                }, {
                                    name: 'displayValue',
                                    type: 'string'
                                }],
                                data: [
                                    [true, 'Available'],
                                    [false, 'Hidden']
                                ]
                            })
                            //,
                            //listeners: {
                            //    afterrender: function (select) {
                            //        if (select.value === null) {
                            //            select.setValue(select.store.getAt(0).get('storedValue'));
                            //        }
                            //    }
                            //}
                        }]
                    }, {
                        defaults: {
                            xtype: 'textfield',
                            labelAlign: 'top',
                            labelSeparator: '',
                            width: 250
                        },
                        items: [{
                            xtype: 'box',
                            itemId: 'discountBlurb',
                            cls: Taco.baseCSSPrefix + 'form-note-box',
                            width: 430,
                            padding: '12 10 10',
                            margin: '45 0 0',
                            style: { textAlign: 'left' },
                            tpl: 'There are <a href="#">{count} active discount(s)</a> assigned to this product.',
                            data: { count: 0, code: -1 },
                            listeners: {
                                click: {
                                    element: 'el', //bind to the underlying el property on the panel
                                    fn: function (e) {
                                        e.stopEvent();
                                        var record = Ext.ComponentManager.get(this.id).up('productedit').data;
                                        Taco.core.StateManager.attemptNavigate('discounts/filter?productcode=' + record.getId());
                                    }
                                }
                            }
                        }]
                    }]
                }]
            }]
        }, {
            xtype: 'container',
            defaults: {
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [{
                xtype: 'htmleditor',
                name: 'productFullDescription',
                fieldLabel: 'Product Description',
                width: 719,
                height: 250
            }, {
                xtype: 'boxselect',
                name: 'categoryIds',
                fieldLabel: 'Categories',
                itemId:'categoryBs',
                width: 724,
                minChars: 2,
                store:{ type: 'Taco.store.Categories', autoLoad: true, id: 'categoryComboBox' },
                cls: Taco.baseCSSPrefix + 'boxselect',
                queryMode: 'local',
                
                displayField: 'path',
                valueField: 'id',
                shortField: 'name',
                triggerOnClick: false,
                pinList: false,
                onTriggerClick: function () {
                    var me = this,
                        categoryModal;

                    categoryModal = Ext.create('Taco.core.ux.modal.ContentWithActions', {
                        combobox: me,
                        autoShow: true,
                        autoSize: true,
                        isValid: true,
                        isDirty: true,
                        title: 'Select Categories',
                        listeners: {
                            save: function () {
                                var s = this.down('categoryselector').getSelectionModel().selected.getRange();
                                this.combobox.setValue(Ext.Array.pluck(s, 'internalId'));
                                this.hide();
                            }
                        },
                        items: [{
                            xtype: 'categoryselector',
                            selected: me.getValue(),
                            height: 400,
                            width: 600,
                            flex: 0,
                            showCheckBoxes: true,
                            enableRowReorder: false
                        }]
                    });
                }
            }]
        }, {
            justify: true,
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                width: 80
            },
            items: [{
                name: 'productCode',
                fieldLabel: 'Product Code',
                width: 220,
                listeners: {
                    change: function () {
                        var parentForm = this.up('form'),
                            grandParentForm = parentForm.up('form'),
                            record = (grandParentForm || parentForm).form.getRecord();
                        if (record && !record.phantom) {
                            if (this.originalValue) {
                                this.reset();
                            }
                            this.setReadOnly(true);
                        }
                    }
                }
            }, {
                xtype: 'selectfield',
                name: 'isTaxable',
                fieldLabel: 'Taxable',
                pack: 'end',
                mode: 'local',
                valueField: 'storedValue',
                displayField: 'displayValue',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: [{
                        name: 'storedValue',
                        type: 'boolean'
                    }, {
                        name: 'displayValue',
                        type: 'string'
                    }],
                    data: [
                        [true, 'Yes'],
                        [false, 'No']
                    ]
                })
            }, {
                xtype: 'unitfield',
                name: 'packageWeight',
                fieldLabel: 'Weight',
                emptyText: 'lbs',
                unitString: ' lbs',
                unitAtEnd: true,
                decimalPrecision: 3,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            }, {
                xtype: 'formflexbox',
                width: 248,
                defaults: {
                    xtype: 'unitfield',
                    labelAlign: 'top',
                    labelSeparator: '',
                    unitString: ' in',
                    unitAtEnd: true,
                    decimalPrecision: 3,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    width: 80
                },
                items: [{
                    name: 'packageLength',
                    fieldLabel: 'Dimensions',
                    emptyText: 'length'
                }, {
                    name: 'packageWidth',
                    fieldLabel: 'Width',
                    labelStyle: 'visibility: hidden',
                    emptyText: 'width'
                }, {
                    name: 'packageHeight',
                    fieldLabel: 'Height',
                    labelStyle: 'visibility: hidden',
                    emptyText: 'height'
                }]
            }]
        }, {
            cls: Taco.baseCSSPrefix + 'inventory-control',
            defaults: {
                xtype: 'selectfield',
                labelAlign: 'top',
                labelSeparator: '',
                width: 220
            },
            items: [{
                name: 'manageStock',
                fieldLabel: 'Inventory Control',


                mode: 'local',
                valueField: 'storedValue',
                displayField: 'displayValue',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: [{
                        name: 'storedValue',
                        type: 'boolean'
                    }, {
                        name: 'displayValue',
                        type: 'string'
                    }],
                    data: [
                        [false, 'Do not track inventory'],
                        [true, 'Track inventory']
                    ]
                })
            }, {
                xtype: 'numberfield',
                name: 'stockOnHand',
                width: 140,
                fieldLabel: 'Qty in stock',
                emptyText: String.fromCharCode(8734),
                decimalPrecision: 0,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            }, {
                xtype: 'selectfield',
                name: 'inventoryHandling',
                width: 300,
                fieldLabel: 'If out of stock',
                mode: 'local',
                hideMode: 'visibility',
                valueField: 'storedValue',
                displayField: 'displayValue',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: [
                        { name: 'storedValue', type: 'int' },
                        { name: 'displayValue', type: 'string' }
                    ],
                    data: [
                        [0, 'Default'],
                        [1, 'Allow Shopper to backorder'],
                        [2, 'Hide when out of stock'],
                        [3, 'Allow Shopper to view Product Details']
                    ]
                })
            }]
        }]
    },

    initComponent: function () {
        var me = this,
            basicForm, msField, sohField, ihField;

        me.callParent(arguments);
        basicForm = me.form.getForm();
        msField = basicForm.findField('manageStock');
        sohField = basicForm.findField('stockOnHand');
        ihField = basicForm.findField('inventoryHandling');

        me.loadDiscountBlurb();

        sohField.on({
            change: function () {
                var sohVal = sohField.getValue();

                if (me.data) {
                    if (msField.getValue()) {
                        me.data.set("stockOnHandAdjustment", {
                            type: 'Absolute',
                            value: sohVal
                        });
                    } else {
                        me.data.set("stockOnHandAdjustment", null);
                    } 
                }
            }
        });

        me.on({
            inventorycontrolchange: function (trigger, enabled) {
                ihField.setVisible(enabled);
                
                if (me.data) {
                    me.data.set("stockOnHandAdjustment", null);
                }
                
                // if (enabled && ihField.getValue() < 1) {
                //     ihField.setValue(2);
                // }

                if (enabled && sohField.getValue() === null) {
                    sohField.setValue(0);
                }
            }
        });

        msField.on({
            change: function (field, newValue, oldValue) {
                me.fireEvent('inventorycontrolchange', field, newValue);
            }
        });

        me.down('multiimagefield').on({
            click: {
                fn: me.multiimagefieldClick,
                scope: me
            }
        });
    },

    loadDiscountBlurb: function () {
        var me = this;
        var bla = Ext.create('Taco.store.Discounts');
        var id = this.recordId.isModel ? this.recordId.getId() : this.recordId;

        bla.filters.add(this.id, Ext.create('Ext.util.Filter', {
            anyMatch: true,
            property: 'productCode',
            value: id,
            root: 'data'
        }));

        bla.load(function (records, operation, success) {
            var blurb = me.down('#discountBlurb');

            if (blurb && records) {
                blurb.update({ count: records.length, code: id });
            }
        });
    },

    multiimagefieldClick: function (e) {
        var me = this;
        var initialSelected = [];
        Ext.Array.each(me.down('multiimagefield').getValue() || [], function (img) {
            var parts = img.imagePath.split('/'),
                id = parts[parts.length - 1];

            initialSelected.push({ id: id, alt: img.alt });
        });


        var associator = Ext.create('Taco.view.fileManagement.MultiFileAssociator', {
            initialSelected: initialSelected,
            showDimensions: false,
            listeners: {
                save: function () {
                    var images = [];
                    associator.getSelectedRecords().each(function (fmf) {
                        images.push({
                            imagePath: '/admin/img/files/' + fmf.getId(),
                            alt: fmf.get('alt')
                        });
                    });

                    //me.data.set('productImages', images);
                    me.down('multiimagefield').setValue(images);
                    //me.data.setDirty();
                    //me.fireEvent('dirtychange', me);
                    associator.hide();
                }
            }
        });




    }
});
