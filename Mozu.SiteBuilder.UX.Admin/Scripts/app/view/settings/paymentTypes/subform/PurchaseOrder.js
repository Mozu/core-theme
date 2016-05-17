/**
 * @class Taco.view.settings.paymentTypes.subform.PurchaseOrder
 *
 */

Ext.define('Taco.view.settings.paymentTypes.subform.PurchaseOrder', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.settings.paymentTypes.subform.PurchaseOrderPaymentTermsGrid',
        'Taco.view.settings.paymentTypes.subform.PurchaseOrderCustomFieldGrid',
        'Taco.view.attribute.AttributeValueGrid',
        'Taco.model.PurchaseOrderPaymentTerms',
        'Taco.model.PurchaseOrderCustomField',
        'Taco.core.ux.content.Tooltip'
    ],
    title: 'Purchase Order',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    initComponent: function() {
        var me = this;

        this.purchaseOrderEnabled = me.record.get('purchaseOrder').isEnabled;
        this.purchaseOrderSplitPaymentEnabled = me.record.get('purchaseOrder').allowSplitPayment;
        this.customFieldsStore = null;
        this.paymentTermsStore = null;
        
        this.purchaseOrderEnabledToggle = Ext.create('Ext.form.Checkbox', {
            itemId: 'purchaseOrderEnabled',
            name: 'purchaseOrderEnabled',
            checked: me.purchaseOrderEnabled,
            boxLabel: 'Enable',
            handler: me.onEnableChange,
            scope: this
        });

        this.purchaseOrderPaymentTerms = this.initializePaymentTermsGrid();
        this.purchaseOrderCustomTextFields = this.initializeTextFieldsGrid();

        this.purchaseOrderContent = Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            width: '100%',
            itemId: 'purchaseOrderContent',
            name: 'purchaseOrderContent',
            hidden: !me.purchaseOrderEnabled,
            margin: '0px 0px 20px 0px',
            items: [
                me.purchaseOrderPaymentTerms,
                me.purchaseOrderCustomTextFields
            ]
        });

        Ext.tip.QuickTipManager.init();

        this.purchaseOrderSplitPaymentToggle = Ext.widget({
            xtype: 'checkbox',
            itemId: 'purchaseOrderSplitPayment',
            name: 'purchaseOrderSplitPayment',
            checked: me.purchaseOrderSplitPaymentEnabled,
            boxLabel: 'Allow split-payment',
            width: 175,
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'purchaseOrderSplitPayment',
                messageKey: 'purchaseOrder.siteSettings.splitPayment',
                hoverTarget: 'boxLabelEl',
                offsetTop: 15,
                offsetLeft: -185,
                arrowPosition: 'left'
            })
        });

        this.purchaseOrderSplitPayment = Ext.create('Ext.form.FieldContainer', {
            layout: 'vbox',
            width: '100%',
            itemId: 'purchaseOrderOptions',
            name: 'purchaseOrderOptions',
            fieldLabel: 'Options',
            hidden: !me.purchaseOrderEnabled,
            items: [
                me.purchaseOrderSplitPaymentToggle
            ]
        });

        this.items = [
            Ext.create('Ext.panel.Panel', {
                width: '100%',
                items: [
                    me.purchaseOrderEnabledToggle,
                    me.purchaseOrderContent,
                    me.purchaseOrderSplitPayment
                ]
            })
        ];

        this.callParent(arguments);

    },

    initializePaymentTermsGrid: function() {
        var me = this;
        var paymentTerms = me.record.get('purchaseOrder').paymentTerms;

        this.paymentTermsStore = Ext.create('Ext.data.ArrayStore', {
            model: 'Taco.model.PurchaseOrderPaymentTerms'
        });

        for (var i = 0; i < paymentTerms.length; ++i) {
            this.paymentTermsStore.add(Ext.create('Taco.model.PurchaseOrderPaymentTerms', paymentTerms[i]));
        }

        this.paymentTermsGrid = {
            xtype: 'payment-terms-grid',
            sortableColumns: false,
            disableSelection: false,
            hideHeaders: false,
            enableColumnHide: false,
            store: me.paymentTermsStore,
            record: me.record,
            columns: [
                {
                    xtype: 'draghandlecolumn',
                    stateId: 'dragHandle',
                    width: 35
                }, {
                    dataIndex: 'description',
                    text: 'Payment Terms',
                    flex: 2,
                    editor: {
                        xtype: 'textfield',
                        hideTrigger: true,
                        ignoreParentFormTracking: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false

                    }
                }, {
                    dataIndex: 'code',
                    text: 'Code',
                    flex: 1,
                    editor: {
                        xtype: 'textfield',
                        hideTrigger: true,
                        ignoreParentFormTracking: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    }
                }
            ],
            listeners: {
                cellclick: function(view, td, cellIndex, record, tr, rowIndex, e) {
                    if (e.getTarget('.taco-actioncolumn-icon-remove', 10)) {
                        view.getStore().remove(record);
                    }
                },
                validateedit: function(editor, e) {
                    var existing = e.grid.store.findRecord('id', e.value, 0, false, false);
                    if (e.field == 'id' && existing) {
                        Taco.app.fireEvent('setmessage', ('The same value ' + existing.getId() + ' already exists'), 'error');
                        return false;
                    }
                    return true;
                }
            }
        };

        this.purchaseOrderPaymentTermsGridCont = {
            xtype: 'form',
            itemId: 'paymentTermsGridContainer',
            gridCfg: me.paymentTermsGrid,
            width: '100%',
            items: [],
            initGrid: function() {
                if (Ext.isArray(this.items)) {
                    this.items = [this.gridCfg];
                } else {
                    this.removeAll(true);
                    this.add(this.gridCfg);
                }
            },
            removeGrid: function() {

            }
        };

        this.purchaseOrderPaymentTermsGridCont.initGrid();

        return Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'vbox',
                align: 'bottom'
            },
            itemId: 'purchaseOrderPaymentTerms',
            name: 'purchaseOrderPaymentTerms',
            flex: 1,
            margin: '0 50 0 0',
            items: [
                {
                    xtype: 'textfield',
                    name: 'addPaymentTermsField',
                    itemId: 'addPaymentTermsField',
                    width: '100%',
                    enableKeyEvents: true,
                    ignoreParentFormTracking: true,
                    submitValue: false,
                    flex: 1,
                    margin: '0 10 0 0',
                    fieldLabel: 'Payment Terms Options',
                    emptyText: 'Enter payment terms and press ENTER',
                    checkDirty: Ext.emptyFn,
                    isDirty: function() {
                        return false;
                    },
                    validate: function() {
                        var me = this,
                            isValid = me.isValid();
                        if (isValid !== me.wasValid) {
                            me.wasValid = isValid;
                        }
                        return isValid;
                    },
                    listeners: {
                        keydown: function(field, e) {
                            if (e.getKey() === e.ENTER && field.isValid()) {
                                var value = field.getValue();

                                if (!Ext.isEmpty(Ext.String.trim(value))) {
                                    field.reset();

                                    var positionSelector = Ext.ComponentQuery.query('#attr-string-value-placement-selector');
                                    var position = (positionSelector.length > 0) ? positionSelector[0].getValue() : 'bottom';
                                    var id = value.toLowerCase().replace(/[^a-zA-Z0-9-_//.]/g, "-");

                                    Taco.app.fireEvent('added-payment-term-value', {
                                        description: value,
                                        id: id,
                                        code: id,
                                        position: position
                                    });
                                }
                            }
                        }
                    }
                }, me.purchaseOrderPaymentTermsGridCont
            ]
        });
    },

    initializeTextFieldsGrid: function() {
        var me = this;
        var customFields = me.record.get('purchaseOrder').customFields;

        this.customFieldsStore = Ext.create('Ext.data.ArrayStore', {
            model: 'Taco.model.PurchaseOrderCustomField'
        });

        for (var i = 0; i < customFields.length; ++i) {
            this.customFieldsStore.add(Ext.create('Taco.model.PurchaseOrderCustomField', customFields[i]));
        }
        
        this.customFieldTextAdd = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox'
            },
            width: '100%',
            itemId: 'customFieldTextAdd',
            name: 'customFieldTextAdd',
            items: [
                {
                    xtype: 'textfield',
                    flex: 1,
                    emptyText: 'Enter label and press ENTER',
                    itemId: 'customFieldTextLabel',
                    name: 'customFieldTextLabel',
                    enableKeyEvents: true,
                    ignoreParentFormTracking: true,
                    submitValue: false,
                    margin: '0 10 0 0',
                    checkDirty: Ext.emptyFn,
                    isDirty: function () {
                        return false;
                    },
                    validate: function () {
                        var me = this,
                            isValid = me.isValid();
                        if (isValid !== me.wasValid) {
                            me.wasValid = isValid;
                        }
                        return isValid;
                    }, listeners: {
                        keydown: function (field, e) {
                            if (e.getKey() === e.ENTER && field.isValid()) {
                                var value = field.getValue();

                                if (!Ext.isEmpty(Ext.String.trim(value))) {
                                    field.reset();

                                    var customCode = value.toLowerCase().replace(/[^a-zA-Z0-9-_//.]/g, "-");
                                    var positionSelector = Ext.ComponentQuery.query('#attr-string-value-placement-selector');
                                    var position = (positionSelector.length > 0) ? positionSelector[0].getValue() : 'bottom';

                                    Taco.app.fireEvent('added-custom-field-value', {
                                        id: customCode,
                                        label: value,
                                        position: position
                                    });
                                }
                            }
                        }
                    }
                }
            ]
        });

        this.customFieldAddContainer = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '100%',
            itemId: 'purchaseOrderAddFieldContainer',
            name: 'purchaseOrderAddFieldContainer',
            fieldLabel: 'Custom Text Fields',
            items: [
                me.customFieldTextAdd
            ],
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'purchaseOrderAddFieldContainer',
                messageKey: 'purchaseOrder.siteSettings.customFields',
                hoverTarget: 'label',
                offsetTop: 0,
                offsetLeft: -135,
                arrowPosition: 'left'
            })
        });

        this.customFieldGrid = {
            xtype: 'custom-field-grid',
            modelName: 'Taco.model.PurchaseOrderCustomField',
            itemId: 'purchaseOrderCustomFieldGrid',
            name: 'purchaseOrderCustomFieldGrid',
            width: '100%',
            sortableColumns: false,
            disableSelection: false,
            hideHeaders: false,
            enableColumnHide: false,
            store: me.customFieldsStore,
            record: me.record,
            columns: [
                 {
                     xtype: 'draghandlecolumn',
                     stateId: 'dragHandle',
                     width: 35
                 }, {
                     xtype: 'checkcolumn',
                     text: 'Enabled',
                     label: 'Enabled',
                     dataIndex: 'isEnabled',
                     align: 'left',
                     flex: 1
                 }, {
                    text: 'Label',
                    dataIndex: 'label',
                    align: 'left',
                    flex: 2,
                    editor: {
                        xtype: 'textfield',
                        hideTrigger: true,
                        ignoreParentFormTracking: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    }
                }, {
                    text: 'Code',
                    dataIndex: 'code',
                    align: 'left',
                    flex: 2,
                    editor: {
                        xtype: 'textfield',
                        hideTrigger: true,
                        ignoreParentFormTracking: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    }
                }, {
                    xtype: 'checkcolumn',
                    text: 'Required',
                    label: 'Required',
                    dataIndex: 'isRequired',
                    align: 'left',
                    flex: 1
                }
            ],
            listeners: {
                cellclick: function (view, td, cellIndex, record, tr, rowIndex, e) {
                    if (e.getTarget('.taco-actioncolumn-icon-remove', 10)) {
                        view.getStore().remove(record);
                    }
                },
                validateedit: function (editor, e) {
                    var existing = e.grid.store.findRecord('id', e.value, 0, false, false);
                    if (e.field == 'id' && existing) {
                        Taco.app.fireEvent('setmessage', ('The same value ' + existing.getId() + ' already exists'), 'error');
                        return false;
                    }
                    return true;
                }
            }, updateParentValues: function() {
                var rawValues = Ext.Array.map(this.getValues(), function(val) {
                    return val.raw;
                });
                this.record.set('customFieldValues', rawValues);
            }

        };

        this.customFieldGridContainer = {
            xtype: 'form',
            itemId: 'customFieldGridContainer',
            name: 'customFieldGridContainer',
            gridCfg: me.customFieldGrid,
            fieldLabel: 'Saved Custom Text Fields',
            width: '100%',
            items: [
                me.customFieldGrid
            ],
            initGrid: function () {
                if (Ext.isArray(this.items)) {
                    this.items = [this.gridCfg];
                } else {
                    this.removeAll(true);
                    this.add(this.gridCfg);
                }
            },
            removeGrid: function () {

            }
        };

        this.customFieldGridContainer.initGrid();

        return Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'vbox',
                align: 'bottom'
            },
            margin: '0 50 0 0',
            flex: 1,
            itemId: 'purchaseOrderCustomFields',
            name: 'purchaseOrderCustomFields',
            items: [
                me.customFieldAddContainer,
                me.customFieldGridContainer
            ]
        });
    },
    
    onEnableChange: function () {
        if (this.purchaseOrderEnabledToggle.getRawValue()) {
            this.purchaseOrderContent.show();
            this.purchaseOrderSplitPayment.show();
        } else {
            this.purchaseOrderContent.hide();
            this.purchaseOrderSplitPayment.hide();
        }
    },

    persistFormValues: function () {
        var me = this;
        var purchaseOrderEnabled = this.purchaseOrderEnabledToggle.getValue();
        var purchaseOrderSplitPayment = this.purchaseOrderSplitPaymentToggle.getValue();

        // fix this array stuff
        var customFields = [];
        var customFieldsToAdd = this.customFieldsStore.data.items;
        for (var j = 0; j < customFieldsToAdd.length; ++j) {
            customFields.push({
                code: customFieldsToAdd[j].get('code'),
                label: customFieldsToAdd[j].get('label'),
                isEnabled: customFieldsToAdd[j].get('isEnabled'),
                isRequired: customFieldsToAdd[j].get('isRequired'),
                sequenceNumber: j
            });
        }

        var paymentTerms = [];
        var paymentTermsToAdd = this.paymentTermsStore.data.items;
        for (var i = 0; i < paymentTermsToAdd.length; ++i) {
            paymentTerms.push({ description: paymentTermsToAdd[i].get('description'), sequenceNumber: i, code: paymentTermsToAdd[i].get('code') });
        }

        var purchaseOrder = {
            "isEnabled": purchaseOrderEnabled,
            "paymentTerms": paymentTerms,
            "customFields": customFields,
            "allowSplitPayment": purchaseOrderSplitPayment
        };

        this.record.set('purchaseOrder', purchaseOrder);
    }
});