
Ext.define('Taco.view.order.widget.ShippingCancellationGrid', {
    extend: 'Ext.grid.Panel',

    title: '',

    cls: 'shipping-cancellation-grid',

    initComponent: function () {
        var me = this;

        var store = me.record.getCancellationReasons(me.shipmentRecord.shipmentType);
        store.load({
            scope: this,
            callback: function (records, operation, success) {
                if (records) {
                    me.reasonCodes = records;
                    me.getView().refresh();
                }
            }
        }); 
        me.store = Ext.create('Ext.data.JsonStore', {
            data: this.shipmentRecord.canceledItems,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            },
            {
                name: 'name',
                type: 'string',
                useNull: true
            }, {
                name: 'quantity',
                type: 'int',
                useNull: true
            }, {
                name: 'actualPrice',
                type: 'float',
                useNull: true
                },
            {
                name: 'overridePrice',
                type: 'float',
                useNull: true
            },
            {
                name: 'unitPrice',
                type: 'float',
                useNull: true,
                persist: false,
                convert: function (value, record) {
                    if (record.get('overridePrice') !== null && record.get('overridePrice') !== undefined) {
                        return record.get('overridePrice');
                    }
                    return record.get('actualPrice');
                }
            },
            {
                name: 'itemTax',
                type: 'int',
                useNull: true
            },
            {
                name: 'discount',
                type: 'int',
                useNull: true
            },
            {
                name: 'total',
                type: 'float',
                useNull: true
            },
            {
                name: 'weight',
                type: 'float',
                defaultValue: 0
            }, {
                name: 'isPackagedStandAlone',
                type: 'boolean'
            }, {
                name: 'lineId',
                type: 'int',
                unseNull: false
            }, {
                name: 'fulfillmentStatus',
                type: 'string',
                useNull: true
            }, {
                name: 'optionAttributeFQN',
                type: 'string',
                useNull: true
            },
                {
                    name: 'canceledReason',
                    type: 'auto',
                    useNull: true
                },
                {
                    name: 'auditInfo',
                    type: 'auto',
                    useNull: true
                }
            ],
            sorters: [{
                sorterFn: function (a, b) {
                    if (a.get('lineId') === b.get('lineId')) {
                        return 0;
                    }
                    return (a.get('lineId') < b.get('lineId') ? -1 : 1);
                }
            }]
        });
        me.columns = [
            {
                dataIndex: 'lineId',
                text: 'Line',
                draggable: false,
                resizable: true,
                width: 60,
                sortable: false,
                menuDisabled: true
            },
            {
                text: 'Date Created',
                dataIndex: 'auditInfo',
                draggable: false,
                resizable: true,
                menuDisabled: true,
                flex:1,
                renderer: function (value) {
                    if (value && value.createDate) {
                        return Ext.Date.format(new Date(value.createDate), 'm/d/y H:i:s');
                    }
                }
            },
            {
                dataIndex: 'name',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                text: 'Qty Canceled',
                dataIndex: 'quantity',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                text: 'Cancellation Reason',
                dataIndex: 'canceledReason',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'left',
                //menuDisabled: true,
                //minWidth: 80,
                flex: 2,
                renderer: function (value) {                    
                    if (value && value.reasonCode) {
                        if (value.reasonCode == 'Other')
                            return value.moreInfo;
                        
                        if (this.reasonCodes && this.reasonCodes.length > 0 ) {
                            for (var i = 0; i < this.reasonCodes.length; i++) {
                                if (value.reasonCode == this.reasonCodes[i].get('reasonCode')) {
                                    return this.reasonCodes[i].get('name');
                                }
                            }
                        }
                        return value.reasonCode;
                    }
                }
            },
            {
                text: 'Canceled By',
                dataIndex: 'auditInfo',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    if (value && value.createBy) {
                        return me.getUserByUserIdField(value.createBy);
                    }
                }
            },
            {
                text: 'Shipment Number',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.shipmentRecord.number;
                }
            },
            {
                dataIndex: 'unitPrice',
                text: 'Unit Price',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            }
        ];
        me.callParent();        
    },

    getUserByUserIdField: function (id) {
        if (!id) {
            return null;
        }

        // look up user id in magical site users global object.
        var user = Ext.Array.findBy(window.Taco.siteUsersRaw, function (u) {
            return u.id === id;
        });
        return (user) ? user.firstName + ' ' + user.lastName : null;
    },

});