/**
 * @class  Taco.view.priceList.form.General
 * @description Price List General Form
 */
Ext.define('Taco.view.priceList.form.General', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-general',
    requires: [
        'Ext.form.field.ComboBox',
        'Ext.form.field.Date',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.priceList.widget.PriceListComboBox'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'General',
    record: null,

    initComponent: function() {
        var me = this;

        Ext.tip.QuickTipManager.init();

        //   vbox
        //     hbox -
        //        1. vbox
        //          hbox
        //              1.name
        //              2.master cat
        //          hbox
        //              1.code
        //              2.status
        //        2. description field

        this.items = [{
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                //row 1
                {
                    xtype: 'panel',
                    width: '100%',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'panel',
                            layout: {
                                type: 'vbox',
                                align: 'top'
                            },
                            width: '50%',
                            items: [
                                {
                                    xtype: 'panel',
                                    layout: {
                                        type: 'hbox',
                                        align: 'top'
                                    },
                                    width: '100%',
                                    items: [
                                        {
                                            name: 'name',
                                            itemId: 'nameField',
                                            fieldLabel: 'Name',
                                            allowBlank: false,
                                            xtype: 'textfield',
                                            margin: '0 30 0 0',
                                            width: '50%',
                                            required: true,
                                            minLength: 3,
                                            maxLength: 200,
                                            enforceMaxLength: true
                                        }, {
                                            xtype: 'pricelistcombobox',
                                            name: 'parentCode',
                                            fieldLabel: 'Parent Price List',
                                            itemId: 'parentCodeField',
                                            width: '50%',
                                            margin: '0 30 0 0',
                                            valueNotFoundText: 'None',
                                            editable: true,
                                            forceSelection: false,
                                            readOnly: !me.record.phantom,
                                            excludedIds: !me.record.phantom ? [this.record.get("code")] : []
                                        }
                                    ]
                                },
                                {
                                    xtype: 'panel',
                                    layout: {
                                        type: 'hbox',
                                        align: 'top'
                                    },
                                    width: '100%',
                                    items: [
                                        {
                                            name: 'code',
                                            fieldLabel: 'Code',
                                            itemId: 'codeField',
                                            xtype: 'textfield',
                                            margin: '0 30 0 0',
                                            width: '50%',
                                            allowBlank: false,
                                            maxLength: 30,
                                            readOnly: !me.record.phantom,
                                            required: true,
                                            regex: /^[a-z0-9_\-]+$/i,
                                            regexText: 'Invalid character. Please choose from alphanumeric, underscore, or hyphen characters.'
                                        }, {
                                            xtype: 'combobox',
                                            name: 'enabled',
                                            fieldLabel: 'Status',
                                            width: '50%',
                                            margin: '0 30 0 0',
                                            valueField: 'id',
                                            displayField: 'name',
                                            queryMode: 'local',
                                            valueNotFoundText: 'not found',
                                            editable: true,
                                            forceSelection: true,
                                            value: me.record ? me.record.get('enabled') : true,
                                            store: [[true, 'Active'], [false, 'Disabled']]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            xtype: 'textarea',
                            itemId: 'descriptionField',
                            name: 'description',
                            width: '50%',
                            height: '100%',
                            fieldLabel: 'Description',
                            maxLength: 500
                        }
                    ]
                }
            ]
        }];

        this.callParent(arguments);
    },

    beforeSave: function () {
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});