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
            data = [{id:null,name:'All'}],
            sites;
        
        Ext.each(Taco.app.context.masterCatalogs, function (mc) {
            Ext.Array.push(data,mc.sites);
        });
        
        sites = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data:data
        }),

        this.items = [{
                name: 'keyword',
                fieldLabel: 'Keyword Search'
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
                name: 'firstName',
                fieldLabel: 'Customer First Name'
            },
            {
                name: 'lastName',
                fieldLabel: 'Customer Last Name'
            },
            {
                name: 'emailAddress',
                fieldLabel: 'Customer Email Address'
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
                    {
                        name:"Open",
                        id:"Open"
                    },
                        {
                            name: "Submitted",
                            id: "Submitted"
                        }, {
                            name: "Processing",
                            id: "Processing"
                        }, {
                            name: "Pending",
                            id: "Pending"
                        },
                        {
                            name: "Pending Review",
                            id: "PendingReview"
                        }, {
                            name: 'Accepted',
                            id: 'Accepted'
                        }, {
                            name: "Completed",
                            id: "Completed"
                        }, {
                            name: "Cancelled",
                            id: "Cancelled"
                        }, {
                            name: "Closed",
                            id: "Closed"
                        }, {
                            name: "Validated",
                            id: "Validated"
                        }, {
                            name: "Errored",
                            id: "Errored"
                        }
                    ]
                })
            }, {
                xtype: 'combobox',
                name: 'paymentstatus',
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
                        {
                            name: "Paid",
                            id: "Paid"
                        }, {
                            name: "Unpaid",
                            id: "Unpaid"
                        }, {
                            name: "Pending",
                            id: "Pending"
                        }
                    ]
                })
            }, {
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
                    {
                        name: "Not Set",
                        id: "Null"
                    },
                        {
                            name: "NotFulfilled",
                            id: "NotFulfilled"
                        }, {
                            name: "PartiallyFulfilled",
                            id: "PartiallyFulfilled"
                        }, {
                            name: "Fulfilled",
                            id: "Fulfilled"
                        }
                    ]
                })
            }, {
                xtype: 'combobox',
                name: 'ordertype',
                fieldLabel: 'Order Type',
                valueField: 'id',
                displayField: 'name',
                editable: true,
                forceSelection: false,
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', "name"],
                    data: [
                        {
                            name: "Online",
                            id: "Online"
                        }, {
                            name: "Offline",
                            id: "Offline"
                        }
                    ]
                })
            }, {
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
                items: [{
                        xtype: 'numberfield',
                        name: 'minTotal',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'numberfield',
                        name: 'maxTotal',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }]
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
                items: [{
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        //                    fieldLabel: 'Modified From',
                        width: 200
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        //fieldLabel: 'Modified To',
                        width: 200
                    }]
            }];
        this.callParent(arguments);
    }
});