/**
 * @class  Taco.view.searchTuningRule.GeneralForm
 * @description Search Tuning Rule General Form
 */
Ext.define('Taco.view.searchTuningRule.GeneralForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-general',
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

                //if (me.productInCatalogInfo && me.scheduledStartDateField.isVisible()) {
                //    // if both fields have values we need to validate the dates are in order;
                //    var isValid = Taco.core.util.Validation.validateDateRange(me.scheduledStartDateField, me.scheduledEndDateField, 'Start date must be before end date', 0);
                //    return isValid;
                //}
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
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                //if (me.productInCatalogInfo && me.scheduledEndDateField.isVisible()) {
                //    // if both fields have values we need to validate the dates are in order;
                //    var isValid = Taco.core.util.Validation.validateDateRange(me.scheduledStartDateField, me.scheduledEndDateField, 'End date must be after start date', 0);
                //    return isValid;
                //}
                return true;
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
            name: 'siteId',
            labelAlign: 'top',
            allowBlank: false,
            editable: false,
            readOnly: !me.record.phantom,
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
            }
        });

        me.statusCombo = Ext.widget({
            xtype: 'combobox',
            fieldLabel: 'Status',
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
            //validateDate: function() {
            //    if (Ext.isEmpty(me.scheduledStartDateField.getValue()) && Ext.isEmpty(me.scheduledEndDateField.getValue())) {
            //        this.markInvalid(this.dateValidationMsg);
            //    }
            //},
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
            }
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
                align: 'top'
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
                                    fieldLabel: 'Name',
                                    allowBlank: false,
                                    xtype: 'textfield',
                                    flex: 1,
                                    margin: '0 20 0 0',
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
                                    flex: 1,
                                    margin: '0 0 0 0',
                                    allowBlank: false,
                                    maxLength: 30,
                                    readOnly: !me.record.phantom,
                                    required: true,
                                    regex: /^[a-z0-9_\-]+$/i,
                                    regexText: 'Invalid character. Please choose from alphanumeric, underscore, or hyphen characters.'
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
                            name: 'description',
                            width: '100%',
                            flex: 1,
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