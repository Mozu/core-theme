/**
 * @class Taco.view.order.AdvancedSearchForm
 */
Ext.define('Taco.view.order.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.AdminUser',
        'Taco.store.ChannelPicker'
    ],

    defaults: {
        width: 480,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this,
            data = [{ id: null, name: 'All' }],
            sites;

        Ext.each(Taco.app.context.masterCatalogs, function (mc) {
            Ext.Array.push(data, mc.sites);
        });

        sites = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: data
        }),

        this.items = [
            {
                name: 'keyword',
                fieldLabel: 'Keyword Search'
            },
            {
                name: 'firstName',
                fieldLabel: 'Customer First Name',
                listeners: {
                    blur: {
                        scope: this,
                        fn: 'escapeSpecialChars'
                    }
                }
            },
            {
                name: 'lastName',
                fieldLabel: 'Customer Last Name',
                listeners: {
                    blur: {
                        scope: this,
                        fn: 'escapeSpecialChars'
                    }
                }
            },
            {
                name: 'emailAddress',
                fieldLabel: 'Customer Email Address'
            },
            {
                xtype: 'numberfield',
                name: 'customerid',
                fieldLabel: 'Customer Account Id'
                /*hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                width: 200*/
            },
            {
                xtype: 'combobox',
                name: 'site',
                allowBlank: true,
                editable: false,
                store: sites,
                valueField: 'id',
                displayField: 'name',
                fieldLabel: 'Site'
            },
            {
                xtype: 'combobox',
                name: 'orderStatus',
                fieldLabel: 'Order Status',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: "Open", id: "Open" },
                        { name: "Submitted", id: "Submitted" },
                        { name: "Processing", id: "Processing" },
                        { name: "Pending", id: "Pending" },
                        { name: "Pending Review", id: "PendingReview" },
                        { name: "Accepted", id: "Accepted" },
                        { name: "Completed", id: "Completed" },
                        { name: "Cancelled", id: "Cancelled" },
                        { name: "Closed", id: "Closed" },
                        { name: "Validated", id: "Validated" },
                        { name: "Errored", id: "Errored" },
                        { name: "Abandoned", id: "Abandoned" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'paymentStatus',
                fieldLabel: 'Payment Status',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: "Paid", id: "Paid" },
                        { name: "Unpaid", id: "Unpaid" },
                        { name: "Pending", id: "Pending" },
                        { name: "Errored", id: "Errored" },
                        { name: "Unpaid or Pending or Errored", id: "Unpaid,Pending,Errored" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'fulfillmentStatus',
                fieldLabel: 'Fulfillment Status',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: "Not Fulfilled", id: "NotFulfilled" },
                        { name: "Partially Fulfilled", id: "PartiallyFulfilled" },
                        { name: "Customer Care", id: "CustomerCare" },
                        { name: "Fulfilled", id: "Fulfilled" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'returnStatus',
                fieldLabel: 'Return Status',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: "None", id: "None" },
                        { name: "In Progress", id: "InProgress" },
                        { name: "Order Partially Returned", id: "Closed" },
                        { name: "Order Fully Returned", id: "ReturnedInFull" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'orderType',
                fieldLabel: 'Order Type',
                valueField: 'id',
                displayField: 'name',
                editable: true,
                forceSelection: false,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: "Online", id: "Online" },
                        { name: "Offline", id: "Offline" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'channel',
                fieldLabel: 'Channel',
                valueField: 'code',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                store: { type: 'Taco.store.ChannelPicker' }
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Total Price Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'numberfield',
                        name: 'minTotal',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    },
                    {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    },
                    {
                        xtype: 'numberfield',
                        name: 'maxTotal',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }
                ]
            },
            {
                xtype: 'taco-adminuserfield',
                name: 'modifiedBy',
                fieldLabel: 'Modified By'
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Modfied Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        altFormats: "c",
                        //fieldLabel: 'Modified From',
                        width: 200
                    },
                    {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    },
                    {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        altFormats: "c",
                        //fieldLabel: 'Modified To',
                        width: 200
                    }
                ]
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Submitted Date Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'submittedFrom',
                        altFormats: "c",
                        //fieldLabel: 'Modified From',
                        width: 200
                    },
                    {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    },
                    {
                        xtype: 'datefield',
                        name: 'submittedTo',
                        altFormats: "c",
                        //fieldLabel: 'Modified To',
                        width: 200
                    }
                ]
            },
            {
                name: 'cardnumber',
                fieldLabel: 'Last Four Digits of Credit Card Number',
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            },
            {
                name: 'returnNumber',
                fieldLabel: 'Return Number',
                xtype: 'numberfield',
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            },
            {
                name: 'orderReferenceNumber',
                fieldLabel: 'Order Reference Number',
                xtype: 'numberfield',
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            },
            {
                name: 'phonenumber',
                fieldLabel: 'Phone Number',
                listeners: {
                    change: {
                        scope: this,
                        fn: 'formatPhoneNumber'
                    }
                }
            },
            {
                name: 'externalid',
                fieldLabel: 'External Id'
            },
            {
                name: 'attributeName',
                fieldLabel: 'Attribute Name'
            }];
        this.callParent(arguments);
    },

    /**
     * Helper for escaping special characters from certain textfields, intended to be used on blur.
     * @param {Ext.Component} field The field.
     * @param {Ext.EventObject} e The event object.
     */
    escapeSpecialChars: function (field, e) {        
        var specialChars = /[\'\"\{\}\[\]]/g; // ' " { } [ ]
        var value = field.getValue();

        if (!Ext.isEmpty(value)) {
            // ^ is the escape character; $& is the matched token
            // removing the escaped chars before escaped, so not to double up if the input is blurred more than once
            field.setValue(value.replace(/\^/g, '').replace(specialChars, '^$&'));
        }
    },

    /**
     * Helper for escaping special characters from phone numbers, intended to be used on blur.
     * @param {Ext.Component} field The field.
     * @param {Ext.EventObject} e The event object.
     */
    formatPhoneNumber: function (field, e) {  
        var value = field.getValue();
        var cleaned = ('' + value).replace(/\D/g, '');
        if (cleaned) {
            field.setValue(cleaned);
        }
    }
});
