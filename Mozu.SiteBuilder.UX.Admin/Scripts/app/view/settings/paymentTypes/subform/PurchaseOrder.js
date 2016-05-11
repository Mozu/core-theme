/**
 * @class Taco.view.settings.paymentTypes.subform.PurchaseOrder
 *
 "purchaseOrder": {
  "isEnabled": false,
  "netTerms": [],
  "allowSplitPayment": false
 }
 */

Ext.define('Taco.view.settings.paymentTypes.subform.PurchaseOrder', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.settings.paymentTypes.subform.NetTermsGrid',
        'Taco.view.attribute.AttributeValueGrid',
        'Taco.model.NetTerms',
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
        this.netTermsStore = null;
        
        this.purchaseOrderEnabledToggle = Ext.create('Ext.form.Checkbox', {
            itemId: 'purchaseOrderEnabled',
            name: 'purchaseOrderEnabled',
            checked: me.purchaseOrderEnabled,
            boxLabel: 'Enable',
            handler: me.onEnableChange,
            scope: this
        });

        this.purchaseOrderNetTerms = this.initializeNetTermsGrid();
        this.purchaseOrderCustomTextFields = this.initializeTextFieldsGrid();

        this.purchaseOrderContent = Ext.create('Ext.form.FieldContainer', {
            layout: 'hbox',
            width: '100%',
            itemId: 'purchaseOrderContent',
            name: 'purchaseOrderContent',
            hidden: !me.purchaseOrderEnabled,
            margin: '0px 0px 20px 0px',
            items: [
                me.purchaseOrderNetTerms,
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
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'purchaseOrderSplitPayment',
                messageKey: 'purchaseOrder.siteSettings.splitPayment',
                hoverTarget: 'boxLabelEl',
                offsetTop: 15,
                offsetLeft: -165,
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

    initializeNetTermsGrid: function() {
        var me = this;
        var netTerms = me.record.get('purchaseOrder').netTerms;

        this.netTermsStore = Ext.create('Ext.data.ArrayStore', {
            model: 'Taco.model.NetTerms'
        });

        for (var i = 0; i < netTerms.length; ++i) {
            this.netTermsStore.add(Ext.create('Taco.model.NetTerms', netTerms[i]));
        }

        /*var model = Ext.create('Taco.model.NetTerms', {
            id: 5,
            value: '10 Days',
            sequenceNumber: 1
        });
        this.netTermsStore.add(model);*/

        this.netTermsGrid = {
            xtype: 'net-terms-grid',
            sortableColumns: false,
            disableSelection: false,
            hideHeaders: false,
            enableColumnHide: false,
            store: me.netTermsStore,
            record: me.record,
            columns: [
                {
                    xtype: 'draghandlecolumn',
                    stateId: 'dragHandle',
                    width: 35
                }, {
                    xtype: 'gridcolumn',
                    sortable: false,
                    dataIndex: 'position',
                    text: 'Pos',
                    hideable: false,
                    width: 100,
                    renderer: function(cmp, metaData, record, index) {
                        return index + 1;
                    }
                }, {
                    dataIndex: 'value',
                    text: 'Value',
                    flex: 2,
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

        this.purchaseOrderNetTermsGridCont = {
            xtype: 'form',
            itemId: 'netTermsGridContainer',
            gridCfg: me.netTermsGrid,
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

        this.purchaseOrderNetTermsGridCont.initGrid();

        return Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'vbox',
                align: 'bottom'
            },
            itemId: 'purchaseOrderNetTerms',
            name: 'purchaseOrderNetTerms',
            flex: 1,
            margin: '0 50 0 0',
            items: [
                {
                    xtype: 'textfield',
                    name: 'addNetTermsField',
                    itemId: 'addNetTermsField',
                    width: 400,
                    enableKeyEvents: true,
                    ignoreParentFormTracking: true,
                    submitValue: false,
                    flex: 1,
                    margin: '0 10 0 0',
                    fieldLabel: 'Net Terms Options',
                    emptyText: 'Enter terms and press ENTER',
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
                                    var id = value;

                                    Taco.app.fireEvent('added-net-term-value', {
                                        value: value,
                                        id: id.replace(/[^a-zA-Z0-9-_//.]/g, "-"),
                                        position: position
                                    });
                                }
                            }
                        }
                    }
                }, me.purchaseOrderNetTermsGridCont
            ]
        });
    },

    initializeTextFieldsGrid: function() {
        var me = this;
        this.shouldAddCustomField = false;
        var memoFields = me.record.get('purchaseOrder').memoFields;

        this.customFieldsStore = Ext.create('Ext.data.ArrayStore', {
            model: 'Taco.model.PurchaseOrderCustomField'
        });

        for (var i = 0; i < memoFields.length; ++i) {
            this.customFieldsStore.add(Ext.create('Taco.model.PurchaseOrderCustomField', memoFields[i]));
        }

        this.addCustomFieldtoGrid = function() {
            var me = this;
            var customFieldGrid = this.down('#purchaseOrderCustomFieldGrid');
            var customField = this.down('#customFieldTextLabel');
            var customCode = customField.getValue().toLowerCase().replace(/[^a-zA-Z0-9-_//.]/g, "-");
            var customRequired = this.down('#customFieldTextRequired');
            var customEnabled = this.down('#customFieldTextEnabled');

            if (!Ext.isEmpty(customField.getValue())) {
                var model = Ext.create('Taco.model.PurchaseOrderCustomField', {
                    code: customCode,
                    label: customField.getValue(),
                    isEnabled: customEnabled.getValue(),
                    isRequired: customRequired.getValue()
                });

                me.customFieldsStore.add(model);
                if (me.customFieldsStore.count() > 0) {
                    customFieldGrid.show();
                }
            }

            customField.setValue('');
            customEnabled.setValue(true);
            customRequired.setValue(false);
        };

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
                    flex: 2,
                    emptyText: 'Text Field Label',
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
                                    me.addCustomFieldtoGrid();
                                }
                            }
                        }
                    }
                }, {
                    xtype: 'checkbox',
                    boxLabel: 'Required',
                    flex: 1,
                    checked: false,
                    margin: '0 10 0 0',
                    itemId: 'customFieldTextRequired',
                    name: 'customFieldTextRequired'
                }, {
                    xtype: 'checkbox',
                    boxLabel: 'Enabled',
                    flex: 1,
                    checked: true,
                    margin: '0 10 0 0',
                    itemId: 'customFieldTextEnabled',
                    name: 'customFieldTextEnabled'
                }, {
                    xtype: 'button',
                    text: 'Add',
                    itemId: 'addCustomField',
                    name: 'addCustomField',
                    margin: '0 10 0 0',
                    handler: me.addCustomFieldtoGrid,
                    scope: me
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

        this.customFieldGrid = Ext.create('Taco.view.attribute.AttributeValueGrid', {
            modelName: 'Taco.model.PurchaseOrderCustomField',
            itemId: 'purchaseOrderCustomFieldGrid',
            name: 'purchaseOrderCustomFieldGrid',
            width: '100%',
            hidden: me.customFieldsStore.count() < 1,
            store: me.customFieldsStore,
            enableEditAction: false,
            enableDeleteAction: true,
            enableAutoSelect: false,
            enablePaging: false,
            enableRowReorder: false,
            columns: [
                {
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
                }, {
                    xtype: 'checkcolumn',
                    text: 'Enabled',
                    label: 'Enabled',
                    dataIndex: 'isEnabled',
                    align: 'left',
                    flex: 1
                }
            ],
            getActionItems: function () {
                var me = this;
                return [{
                    text: 'Remove',
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record;
                        me.removeRow(record);
                    }
                }];
            }

        });

        this.customFieldGridContainer = Ext.create('Ext.form.FieldContainer', {
            itemId: 'customFieldGridContainer',
            name: 'customFieldGridContainer',
            fieldLabel: 'Saved Custom Text Fields',
            width: '100%',
            items: [
                me.customFieldGrid
            ]
        });

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
        //TODO finish this to save the data!
        var me = this;
        var purchaseOrderEnabled = this.purchaseOrderEnabledToggle.getValue();
        var purchaseOrderSplitPayment = this.purchaseOrderSplitPaymentToggle.getValue();

        // fix this array stuff
        var customFields = [];
        this.customFieldsStore.each(function(value) {
            customFields.push({
                code: value.get('code'),
                label: value.get('label'),
                isEnabled: value.get('isEnabled'),
                isRequired: value.get('isRequired')
            });
        });

        var netTerms = [];
        this.netTermsStore.each(function(value) {
            netTerms.push({
                value: value.get('value'),
                sequenceNumber: value.get('sequenceNumber'),
            });
        });

        var purchaseOrder = {
            "isEnabled": purchaseOrderEnabled,
            "netTerms": netTerms,
            "memoFields": customFields,
            "allowSplitPayment": purchaseOrderSplitPayment
        };

        this.record.set('purchaseOrder', purchaseOrder);
    }
});