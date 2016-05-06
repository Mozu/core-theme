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
        'Taco.model.NetTerms',
        'Taco.model.PurchaseOrderCustomField'
    ],
    title: 'Purchase Order',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    initComponent: function() {
        var me = this;

        me.purchaseOrderEnabled = me.record.get('purchaseOrder').isEnabled;

        me.purchaseOrderEnabledToggle = Ext.create('Ext.form.Checkbox', {
            itemId: 'purchaseOrderEnabled',
            name: 'purchaseOrderEnabled',
            checked: me.purchaseOrderEnabled,
            boxLabel: 'Enable',
            handler: me.onEnableChange,
            scope: this
        });

        me.purchaseOrderNetTerms = this.initializeNetTermsGrid();
        me.purchaseOrderCustomTextFields = this.initializeTextFieldsGrid();

        me.purchaseOrderContent = Ext.create('Ext.form.FieldContainer', {
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

        me.purchaseOrderSplitPayment = Ext.create('Ext.form.FieldContainer', {
            layout: 'vbox',
            width: '100%',
            itemId: 'purchaseOrderOptions',
            name: 'purchaseOrderOptions',
            fieldLabel: 'Options',
            hidden: !me.purchaseOrderEnabled,
            items: [
                {
                    xtype: 'checkbox',
                    name: 'purchaseOrderSplitPayment',
                    itemId: 'purchaseOrderSplitPayment',
                    boxLabel: 'Allow split-payment'
                }
            ]
        });

        me.items = [
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

        me.netTermsStore = Ext.create('Ext.data.ArrayStore', {
            model: 'Taco.model.NetTerms',
            data: me.record.get('purchaseOrder').netTerms
        });

        me.netTermsGrid = {
            xtype: 'net-terms-grid',
            width: 400,
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

        me.purchaseOrderNetTermsGridCont = {
            xtype: 'form',
            itemId: 'netTermsGridContainer',
            gridCfg: me.netTermsGrid,
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

        me.purchaseOrderNetTermsGridCont.initGrid();

        return Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'vbox',
                align: 'bottom'
            },
            itemId: 'purchaseOrderNetTerms',
            name: 'purchaseOrderNetTerms',
            flex: 1,
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

                                    Taco.app.fireEvent('added-attribute-value', {
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
        me.addCustomField = false;

        var customFieldsStore = Ext.create('Ext.data.ArrayStore', {
            model: 'Taco.model.PurchaseOrderCustomField',
            data: me.record.get('purchaseOrder').memoFields
        });

        me.handleCustomTextField = function () {

            if (!me.addCustomField) {
                me.customFieldAddButton.hide();
                me.customFieldTextAdd.show();
            } else {
                me.customFieldAddButton.show();
                me.customFieldTextAdd.hide();
            }

            me.addCustomField = !me.addCustomField;
        }

        me.customFieldAddButton = Ext.create('Ext.Button', {
            text: 'Add a Text Field',
            itemId: 'addCustomField',
            name: 'addCustomField',
            height: 32,
            handler: me.handleCustomTextField
        });



        me.customFieldTextAdd = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox'
            },
            width: '100%',
            hidden: true,
            itemId: 'customFieldTextAdd',
            name: 'customFieldTextAdd',
            items: [
                {
                    xtype: 'textfield',
                    width: 300,
                    emptyText: 'This still needs work...',//'Text Field Label',
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
                    }
                }, {
                    xtype: 'checkbox',
                    label: 'Required',
                    width: 100,
                    itemId: 'customFieldTextRequired',
                    name: 'customFieldTextRequired'
                }, {
                    xtype: 'checkbox',
                    label: 'Enabled',
                    width: 100,
                    checked: true,
                    itemId: 'customFieldTextRequired',
                    name: 'customFieldTextRequired'
                }
            ]
        });

        me.customFieldAddContainer = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: 500,
            itemId: 'purchaseOrderAddFieldContainer',
            name: 'purchaseOrderAddFieldContainer',
            fieldLabel: 'Custom Text Fields',
            items: [
                me.customFieldAddButton,
                me.customFieldTextAdd
            ]
        });

        return Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'vbox',
                align: 'bottom'
            },
            flex: 1,
            itemId: 'purchaseOrderCustomFields',
            name: 'purchaseOrderCustomFields',
            items: [
                me.customFieldAddContainer
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

    persistFormValue: function () {
        //TODO finish this to save the data!
        var me = this;
        var isDirty = false;

    }
});