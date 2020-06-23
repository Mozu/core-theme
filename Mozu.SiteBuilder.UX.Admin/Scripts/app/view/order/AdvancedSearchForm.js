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
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.keyword_search
            },
            {
                name: 'firstName',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.customer_first_name,
                listeners: {
                    blur: {
                        scope: this,
                        fn: 'escapeSpecialChars'
                    }
                }
            },
            {
                name: 'lastName',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.customer_last_name,
                listeners: {
                    blur: {
                        scope: this,
                        fn: 'escapeSpecialChars'
                    }
                }
            },
            {
                name: 'emailAddress',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.customer_email_address
            },
            {
                xtype: 'numberfield',
                name: 'customerid',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.customer_account_id
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
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.site
            },
            {
                xtype: 'combobox',
                name: 'orderStatus',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.order_status,
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: Localizer.langResources.ORDERS.Orders.AdvancedFilter.not_found,
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.open, id: "Open" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.submitted, id: "Submitted" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.processing, id: "Processing" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.pending, id: "Pending" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.pending_review, id: "PendingReview" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.accepted, id: "Accepted" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.completed, id: "Completed" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.cancelled, id: "Cancelled" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.closed, id: "Closed" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.validated, id: "Validated" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.errored, id: "Errored" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderStatus.abandoned, id: "Abandoned" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'paymentStatus',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.PaymentStatus.payment_status,
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: Localizer.langResources.ORDERS.Orders.AdvancedFilter.not_found,
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.PaymentStatus.paid, id: "Paid" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.PaymentStatus.unpaid, id: "Unpaid" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.PaymentStatus.pending, id: "Pending" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.PaymentStatus.unpaid_pending, id: "Unpaid,Pending" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'fulfillmentStatus',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.FulfillmentStatus.fulfillment_status,
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: Localizer.langResources.ORDERS.Orders.AdvancedFilter.not_found,
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.FulfillmentStatus.not_fulfilled, id: "NotFulfilled" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.FulfillmentStatus.partially_fulfilled, id: "PartiallyFulfilled" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.FulfillmentStatus.customer_care, id: "CustomerCare" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.FulfillmentStatus.fulfilled, id: "Fulfilled" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'shipmentstatuses',
                fieldLabel: 'Shipment Status',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: "Ready", id: "READY" },
                        { name: "Backorder", id: "BACKORDER" },
                        { name: "Fulfilled", id: "FULFILLED" },
                        { name: "Customer Care", id: "CUSTOMER_CARE" },
                        { name: "Cancelled", id: "CANCELED" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'returnStatus',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.ReturnStatus.return_status,
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: Localizer.langResources.ORDERS.Orders.not_found,
                editable: true,
                forceSelection: true,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.ReturnStatus.none, id: "None" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.ReturnStatus.in_progress, id: "InProgress" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.ReturnStatus.order_partially_returned, id: "Closed" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.ReturnStatus.order_fully_returned, id: "ReturnedInFull" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'orderType',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderType.order_type,
                valueField: 'id',
                displayField: 'name',
                editable: true,
                forceSelection: false,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderType.online, id: "Online" },
                        { name: Localizer.langResources.ORDERS.Orders.AdvancedFilter.OrderType.offline, id: "Offline" }
                    ]
                })
            },
            {
                xtype: 'combobox',
                name: 'channel',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.channel,
                valueField: 'code',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: Localizer.langResources.ORDERS.Orders.AdvancedFilter.not_found,
                editable: true,
                forceSelection: true,
                store: { type: 'Taco.store.ChannelPicker' }
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.total_price_range,
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
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.modified_by
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.modified_range,
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
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.submitted_date_range,
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
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.cardnumber,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            },
            {
                name: 'returnNumber',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.return_number,
                xtype: 'numberfield',
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            },
            {
                name: 'orderReferenceNumber',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.order_reference_number,
                xtype: 'numberfield',
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            },
            {
                name: 'phonenumber',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.phone_number,
                listeners: {
                    change: {
                        scope: this,
                        fn: 'formatPhoneNumber'
                    }
                }
            },
            {
                name: 'externalid',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.external_id
            },
            {
                name: 'attributeName',
                fieldLabel: Localizer.langResources.ORDERS.Orders.AdvancedFilter.attribute_name
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
