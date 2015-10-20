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
    cls: 'taco-subform-noborder taco-subform-nopadding taco-subform-nohr',
    margin: '0 0 39 0',

    title: 'General',
    dateValidationMsg: "An active start or end date is required",

    initComponent: function() {
        var me = this;
        // horizontal space between fields
        var defaultFieldMargin = 50;
        // how wide should fields be that display currency amounts
        var defaultFieldWidth = 250; //166; // 3 column width
        //widest width that will fit in an override container at the smallest browser width;
        var fullFieldWidth = (defaultFieldWidth * 3) + (2 * defaultFieldMargin);
        // field width when part of a two column layout
        var twoColumnFieldWidth = (fullFieldWidth / 4)  -  (defaultFieldMargin/2);

        Ext.tip.QuickTipManager.init();

        me.scheduledStartDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Start Date',
            name: 'startDate',
            width: twoColumnFieldWidth,
            margin:"0 50 0 0",
            itemId: 'startDateFld',
            pickerOffset: 4,
            hidden: (!this.record || this.record.get('status') !== 'Scheduled'),
            value: this.record ? this.record.get('startDate') : "",
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                //if (me.productInCatalogInfo && me.scheduledStartDateField.isVisible()) {
                //    // if both fields have values we need to validate the dates are in order;
                //    var isValid = Taco.core.util.Validation.validateDateRange(me.scheduledStartDateField, me.scheduledEndDateField, "Start date must be before end date", 0);
                //    return isValid;
                //}
                return true;
            }
        });

        me.scheduledEndDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'End Date',
            name: 'endDate',
            itemId: 'endDateFld',
            width: twoColumnFieldWidth,
            margin: "0 0 0 0",
            pickerOffset: 4,
            hidden: (!this.record || this.record.get('status') !== 'Scheduled'),
            value: this.record ? this.record.get('endDate') : "",
            allowBlank: true,
            validateOnBlank: true,
            validator: function () {
                // need to update the validation message on the status combo. it will display the requirment that one or more dates is required
                me.statusCombo.validate();

                //if (me.productInCatalogInfo && me.scheduledEndDateField.isVisible()) {
                //    // if both fields have values we need to validate the dates are in order;
                //    var isValid = Taco.core.util.Validation.validateDateRange(me.scheduledStartDateField, me.scheduledEndDateField, "End date must be after start date", 0);
                //    return isValid;
                //}
                return true;
            }
        });
        var siteStore = Ext.create('Ext.data.Store', {
            fields: ['id', "name"],
            data: me.record.getSites()
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
            forceSelection: true,
            autoSelect: true,
            listConfig: {shadow: false},
            width: twoColumnFieldWidth,
            margin:"0 50 0 0",
            queryMode:'local',
            store: siteStore,
                //[['Active', 'Active'], ['Scheduled', 'Scheduled'], ['Disable', 'Disabled']],
            //value: defaultSite,
            valueField: 'id',
            displayField: 'name'
        });

        me.siteCombo.select(defaultSite);

        me.statusCombo = Ext.widget({
            xtype: 'combobox',
            fieldLabel: 'Status',
            name: 'status',
            labelAlign: 'top',
            allowBlank: false,
            editable: false,
            forceSelection: true,
            listConfig: { shadow: false },
            width: twoColumnFieldWidth,
            margin: "0 0 0 0",
            store: [['Active', 'Active'], ['Scheduled', 'Scheduled'], ['Disable', 'Disabled']],
            value: me.record ? me.record.get('status') : 'Disable',
            dateValidationMsg: "A scheduled start or end date is required",
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
                type: "hbox",
                align: "stretch"
            },
            items: [
                {
                    xtype: 'fieldcontainer',
                    flex: 1,
                    layout: "vbox",
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            layout: {
                                type: "hbox",
                                //width: "100%"
                                align: "stretch"
                            },
                            items: [
                                {
                                    name: 'name',
                                    fieldLabel: 'Name',
                                    allowBlank: false,
                                    xtype: 'textfield',
                                    width: twoColumnFieldWidth,
                                    margin: "0 50 0 0",
                                    required: true,
                                    minLength: 3,
                                    maxLength: 200,
                                    enforceMaxLength: true
                                }, {
                                    name: 'code',
                                    fieldLabel: 'Code',
                                    itemId: "codeField",
                                    xtype: 'textfield',
                                    width: twoColumnFieldWidth,
                                    margin: "0 0 0 0",
                                    allowBlank: false,
                                    maxLength: 30,
                                    required: true,
                                    regex: /^[a-z0-9_\-]+$/i,
                                    regexText: 'Invalid character. Please choose from alphanumeric, underscore, or hyphen characters.'
                                }
                            ]
                        }, {
                            xtype: 'fieldcontainer',
                            layout: {
                                type: "hbox",
                                align: "stretch"
                            },
                            items: [
                                me.siteCombo,
                                me.statusCombo
                            ]
                        }, {
                            xtype: 'fieldcontainer',
                            layout: {
                                type: "hbox",
                                align: "stretch"
                            },
                            items: [
                                me.scheduledStartDateField,
                                me.scheduledEndDateField
                            ]
                        }
                    ]
                }, {
                    xtype: 'fieldcontainer',
                    margin: {
                        left: 20
                    },
                    layout: {
                        type: "vbox"
                    },
                    flex: 1,
                    items: [
                        {
                            xtype: 'textarea',
                            name: 'description',
                            width: "100%",
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

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});