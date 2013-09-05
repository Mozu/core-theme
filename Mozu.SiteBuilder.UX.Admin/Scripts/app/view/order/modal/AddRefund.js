/**
 * @class Taco.view.order.modal.IssueCredit
 */
Ext.define('Taco.view.order.modal.AddRefund', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: [
      //  'Taco.model.PaymentReference',
      //  'Taco.model.Shipment'
    ],
    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    destroyOnHide: true,
    width: 700,
    //    data: {},
    //    field: '',
    initComponent: function (eOpts) {
        var me = this,
            validPaymetns = [];
        //Ext.each(me.order.data.payments, function (payment) {
        //    if ( payment.status == 'Collected')
        //})

        me.store = Ext.create('Ext.data.Store', {
            fields: [
                'id', 'cardType', 'cardNumber', 'amountCollected', {
                    name: 'amountToRefund',
                    type: 'number',
                    defaultValue:0
                }
            ],
            data: me.order.data.payments,
            filters: [
                function (item) {
                    return item.raw.status == 'Collected';
                }
            ]
        });
        me.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: me.store,
            viewConfig: {
                cls: 'editmode-enabled'
            },
            columns: [
                {
                    text: 'Card Type',
                    dataIndex: 'cardType'
                },
                {
                    text: 'Card Number',
                    dataIndex: 'cardNumber',
                    flex:1
                },
            {
                text: 'Card Number',
                dataIndex: 'amountCollected',
                renderer: Ext.util.Format.usMoney
            },
                {
                    text: 'RefundAmount',
                    tdCls: "editableCell",
                    dataIndex: 'amountToRefund',
                    editor: {
                        xtype: 'numberfield',
                        hideTrigger: true,
                        minValue: 0
                    },
                    renderer: Ext.util.Format.usMoney
                }
            ],
            //selType: 'cellmodel',
            listeners: {
                edit: me.onGridEdit,
                scope: me
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });
        

        me.content = {
            xtype: 'container',
            items: [
                {
                    xtype: 'component',
                    autoEl: {
                        tag: 'h2',
                        cls: 'order-modal-title',
                        html: 'Add Refund'
                    }
                },
                 me.grid
            ]
        };

        me.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
            xtype: 'dirtybutton',
            text: 'Save',
            onClick: function () {
                me.save();
            }
        });

        me.actions = {
            xtype: 'container',
            items: [this.dirtyButton, {
                xtype: 'action',
                text: 'Cancel',
                onClick: function () {
                    me.fireEvent('cancel',me);
                }
            }]
        };


        
        this.callParent(arguments);


        
    },
    onGridEdit: function () {
        var me = this,
            savableState = me.store.findBy(function (item) { return item.get('amountToRefund') > 0; }) > -1;
        me.dirtyButton.setDirty(savableState);

    },
    save: function () {
        var me = this,
            payments = [];
        me.store.each(function (item) {
            if (item.get('amountToRefund') > 0) {
                payments.push({
                    orderId: me.order.getId(),
                    returnId: me.record.getId(),
                    paymentType: 'CreditCard',//Check
                    amount: item.get('amountToRefund'),
                    paymentId: item.get('id')
                });
            }

        });
        me.fireEvent('save',me, payments);

        //order.Id, paymentId,
        //                                             new Contracts.Payments.PaymentAction
        //{
        //    ActionName = Constants.ActionNames.Payment.ApplyCheck,
        //    Amount = order.Total,
        //    CheckNumber = "123445",
        //    ISOCurrencyCode = "USD"
        //})

    }
});