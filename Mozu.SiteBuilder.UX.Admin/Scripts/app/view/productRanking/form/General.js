/**
 * @class  Taco.view.productRanking.form.General
 * @description Product Ranking Rule General Form
 */
Ext.define('Taco.view.productRanking.form.General', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-productRanking-general',
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
    dateValidationMsg: 'An active start or end date is required',

    initComponent: function() {
        var me = this;

        Ext.tip.QuickTipManager.init();

        me.scheduledStartDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Active Start Date',
            name: 'startDate',
            flex: 1,
            margin: '0 20 0 0',
            itemId: 'startDateFld',
            pickerOffset: 4,
            hidden: (!this.record || this.record.get('status') !== 'Scheduled'),
            value: this.record ? this.record.get('startDate') : '',
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                return true;
            }
        });

        me.scheduledEndDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Active End Date',
            name: 'endDate',
            itemId: 'endDateFld',
            flex: 1,
            pickerOffset: 4,
            hidden: (!this.record || this.record.get('status') !== 'Scheduled'),
            value: this.record ? this.record.get('endDate') : '',
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                return me.statusCombo.validate();
            }
        });
        var siteStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: me.record.getSites(me.isCatalogLevel)
        });
        var defaultSite = (me.record && me.record.get('siteId'))
                        ? me.record.get('siteId')
                        : Taco.app.context.getContextAtLevel('s').getSiteId();

        me.siteCombo = Ext.widget({
            xtype: 'combobox',
            fieldLabel: 'Site',
            itemId:     'siteField',
            name: 'siteId',
            labelAlign: 'top',
            allowBlank: false,
            editable: false,
            readOnly: !me.record.phantom || siteStore.getTotalCount() <= 1,
            forceSelection: true,
            autoSelect: true,
            listConfig: {shadow: false},
            flex: 1,
            margin:'0 20 0 0',
            queryMode:'local',
            store: siteStore,
            valueField: 'id',
            displayField: 'name',
            listeners: {
                afterrender: function(cmp) {
                    cmp.setValue(defaultSite);
                }
            },
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'siteField',
                offsetLeft: -45,
                offsetTop: -19,
                arrowPosition: 'left'
            })
        });

        me.statusCombo = Ext.widget({
            xtype: 'combobox',
            fieldLabel: 'Status',
            itemId: 'statusField',
            name: 'status',
            labelAlign: 'top',
            allowBlank: false,
            editable: false,
            forceSelection: true,
            listConfig: { shadow: false },
            flex: 1,
            //maxHeight: 200,
            margin: '0 0 0 0',
            store: [['Active', 'Active'], ['Scheduled', 'Scheduled'], ['Disable', 'Disabled']],
            value: me.record ? me.record.get('status') : 'Disable',
            dateValidationMsg: 'A scheduled start or end date is required',
            validator: function () {
                // check to see if the start and end dates have a value;
                if (this.getValue() === 'Scheduled' && Ext.isEmpty(me.scheduledStartDateField.getValue()) && Ext.isEmpty(me.scheduledEndDateField.getValue())) {
                    return this.dateValidationMsg;
                }
                return true;
            },
            listeners: {
                change: function (cmp, newValue) {
                    me.record.set('isActive', newValue === 'Scheduled' || newValue === 'Active');
                    //show eff dates.
                    //me.enableDateRangeFields(me, me.scheduledStartDateField, me.scheduledEndDateField, (newValue === 'Scheduled'));
                    me.scheduledStartDateField.setVisible(newValue === 'Scheduled');
                    //me.scheduledStartDateField.setDisabled(newValue !== 'Scheduled');
                    me.scheduledEndDateField.setVisible(newValue === 'Scheduled');
                    //me.scheduledEndDateField.setDisabled(newValue !== 'Scheduled');
                    if (newValue !== 'Scheduled') {
                        me.scheduledStartDateField.setValue(null);
                        //me.scheduledStartDateField
                        me.scheduledEndDateField.setValue(null);
                    }
                    // force the combo to do a validity check and bypass the ext check for changes in validity;
                    cmp.wasValid = null;


                },

                scope: this
            },
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'statusField',
                offsetLeft: -57,
                offsetTop: -19,
                arrowPosition: 'left'
            })
        });

        // hbox
        //   vbox
        //     hbox - 2 fields
        //     hbox - 2 fields
        //     hbox - 2 hidden fields
        //   description

        this.items = [{
            xtype: 'fieldcontainer',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'fieldcontainer',
                    flex: 1,
                    layout: 'vbox',
                    items: [
                        {
                            xtype: 'fieldcontainer',
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
                                    flex: 1,
                                    margin: '0 20 0 0',
                                    required: true,
                                    minLength: 3,
                                    maxLength: 200,
                                    enforceMaxLength: true,
                                    tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                                        elementId: 'nameField',
                                        offsetLeft: -56,
                                        offsetTop: -19,
                                        arrowPosition: 'left'
                                    })
                                }, 
                                {
                                    name: 'code',
                                    fieldLabel: 'Code',
                                    itemId: 'codeField',
                                    xtype: 'textfield',
                                    flex: 1,
                                    margin: '0 0 0 0',
                                    allowBlank: false,
                                    maxLength: 30,
                                    readOnly: !me.record.phantom,
                                    required: true,
                                    regex: /^[a-z0-9_\-]+$/i,
                                    regexText: 'Invalid character. Please choose from alphanumeric, underscore, or hyphen characters.',
                                    tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                                        elementId: 'codeField',
                                        offsetLeft: -53,
                                        offsetTop: -19,
                                        arrowPosition: 'left'
                                    })
                                }
                            ]
                        }, {
                            xtype: 'fieldcontainer',
                            layout: {
                                type: 'hbox',
                                align: 'top'
                            },
                            width: '100%',
                            items: [
                                me.siteCombo,
                                me.statusCombo
                            ]
                        }, {
                            xtype: 'fieldcontainer',
                            layout: {
                                type: 'hbox',
                                align: 'top'
                            },
                            width: '100%',
                            items: [
                                me.scheduledStartDateField,
                                me.scheduledEndDateField
                            ]
                        }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    margin: {
                        left: 20
                    },
                    layout: {
                        type: 'vbox'
                    },
                    flex: 1,
                    items: [
                        {
                            xtype: 'textarea',
                            itemId: 'descriptionField',
                            name: 'description',
                            width: '100%',
                            flex: 1,
                            fieldLabel: 'Description',
                            maxLength: 500,
                            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                                elementId: 'descriptionField',
                                offsetLeft: -76,
                                offsetTop: -19,
                                arrowPosition: 'left'
                            })
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