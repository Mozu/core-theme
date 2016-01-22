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
        'Taco.core.util.Validation'
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
        //        hbox
        //          2 fields
        //        description field
        //     hbox
        //       1 field

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
                                type: 'hbox',
                                align: 'top'
                            },
                            width: '50%',
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
                                }, 
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
                                }
                            ]
                        },
                        {
                            xtype: 'textarea',
                            itemId: 'descriptionField',
                            name: 'description',
                            width: '50%',
                            fieldLabel: 'Description',
                            maxLength: 500
                        }
                    ]
                },
                //row 2
                {
                    xtype: 'panel',
                    layout: {
                        type: 'hbox',
                        align: 'top'
                    },
                    width: '100%',
                    items: [
                        //statusCombo
                        {
                            xtype: 'combobox',
                            name: 'isActive',
                            fieldLabel: 'Status',
                            width: '50%',
                            margin: '0 30 0 0',
                            valueField: 'id',
                            displayField: 'name',
                            queryMode: 'local',
                            valueNotFoundText: 'not found',
                            editable: true,
                            forceSelection: true,
                            value: me.record ? me.record.get('isActive') : true,
                            store: [[true, 'Active'], [false, 'Disabled']]
                        }
                    ]
                }



                //,
                //{
                //    xtype: 'panel',
                //    margin: {
                //        left: 20
                //    },
                //    layout: {
                //        type: 'vbox'
                //    },
                //    flex: 1,
                //    items: [
                //
                //    ]
                //}
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