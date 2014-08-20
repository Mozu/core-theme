/**
 * @class Taco.view.order.modal.AddRefund
 */

Ext.define('Taco.view.order.modal.AddRefund', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'large',
    title: 'Add Refund',

    layout: {
        type: 'fit'
    },
    
    initComponent: function () {
        var me = this;

        this.store = Ext.create('Ext.data.Store', {
            fields: [
                'id',
                'cardType',
                'cardNumber',
                'amountCollected',
                'amountAuthorized',
                'amountCredited',
                'paymentType',
                'status',
                {
                    name: 'amountToRefund',
                    type: 'number',
                    defaultValue: 0
                }
            ],
            data: this.order.data.payments,
            filters: [
                function (item) {
                    return (item.raw.amountCollected);
                }
            ]
        });

        this.creditCardRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: 'Refund Payment',
            name: 'paymentType',
            inputValue: 'card',
            checked: true,
            handler: function (radio) {
                this.checkValidity();
                if (radio.getValue()) {
                    this.grid.show();
                    this.storeCreditPanel.hide();
                }
            },
            scope: this
        });
        
        this.instoreCreditRadio = Ext.create('Ext.form.field.Radio', {
            boxLabel: 'Issue Credit',
            name: 'paymentType',
            inputValue: 'credit',
            handler: function (radio) {
                if (radio.getValue()) {
                    //show other panel
                    this.storeCreditPanel.show();
                    this.grid.hide();
                }
            },
            scope: this
        });

        this.paymentSelection = Ext.create('Ext.form.FieldContainer', {
            defaultType: 'radiofield',
            vertical: true,
            items: [
                 this.creditCardRadio, this.instoreCreditRadio
            ],
            scope: this
        },this);
        
        this.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: this.store,
            viewConfig: {
                deferEmptyText: false,
                emptyText: 'No payments available to refund. Check to make sure the payments have been captured.',
                overItemCls: 'taco-grid-row-over',
                stripeRows: false
            },
            columns: [{
                text: 'Payment details',
                flex:1,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'cardType',
                cardTemplate: new Ext.XTemplate([
                    '{cardType}: {cardNumber}'
                ]),
                checkTemplate: new Ext.XTemplate([
                    'Check'
                ]),
                renderer: function (value, metaData, record) {
                    var str = '';

                    if (record.get('paymentType') === 'CreditCard') {
                        str = metaData.column.cardTemplate.apply(record.getData());
                    } else {
                        str = metaData.column.checkTemplate.apply(record.getData());
                    }

                    return str;
                }
            }, {
                text: 'Amount Collected',
                width:150,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'amountCollected',
                renderer: function (value) {
                    return me.order.formatCurrency(value);
                }
            }, {
                text: 'Refund Amount',
                width:150,
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                dataIndex: 'amountToRefund',
                editor: {
                    xtype: 'numberfield',
                    showBorder:true,
                    hideTrigger: true,
                    selectOnFocus: true,
                    mouseWheelEnabled:false,
                    minValue: 0
                },
                renderer: function (value) {
                    return me.order.formatCurrency(value);
                }
            }],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            scope: this
        });
        
        var totalOrder = 0;
        Ext.Array.each(this.order.data.payments, function(item) {
            totalOrder += item.amountCollected;
        });

        this.storeCreditPanel = Ext.create('Ext.form.Panel', {
            hidden: true,
            defaults: {
              width: 500  
            },
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Original Amount',
                name: 'originalAmount',
                value: totalOrder,
                readOnly: true
            }, /*{
                xtype: 'textfield',
                fieldLabel: 'Store Credit ID',
                allowBlank: false 
            }, */{
                xtype: 'numberfield',
                fieldLabel: 'Refund Amount',
                name: 'refundAmount',
                hideTrigger: true,
                allowBlank: false
            }/*, {
                xtype: 'textarea',
                fieldLabel: 'Transaction History',
                allowBlank: false
            }, {
                xtype: 'checkboxfield',
                fieldLabel: 'Email store credit information to customer'
            }*/],
            scope: this
        });

        this.items = [
                {
                    xtype: 'container',
                    items: [this.paymentSelection, this.grid, this.storeCreditPanel]
                }
            ];
        
        this.callParent(arguments);

        

        this.storeCreditPanel.on({
           validitychange: {
               scope: this,
               fn: 'checkValidity'
           } 
        });

        this.grid.on({
           edit: {
                scope: this,
                fn: 'checkValidity'
            },
            viewready: {
                scope: this,
                fn: 'checkValidity'
            }
        });

        this.primaryAction = this.down('#primaryAction');
    },

    checkValidity: function () {

        var primaryAction = this.primaryAction,
            refundIndex;
        
        if (this.creditCardRadio.getValue()) {
            // determine if any record in the store has a refund of more than 0 dollars
            refundIndex = this.grid.store.findBy(function(item) {
                return item.get('amountToRefund') > 0;
            });
            // if such a record was found, disable the save button
            primaryAction.setDisabled(refundIndex === -1);
        } else {
            primaryAction.setDisabled(!this.storeCreditPanel.getForm().isValid());
        }        
    },
    
    doSave: function () {
        var me = this,
            payments = [];

        if (this.creditCardRadio.getValue()) {
            this.store.each(function (item) {
                if (item.get('amountToRefund') > 0) {
                    payments.push({
                        orderId: this.order.getId(),
                        returnId: this.record.getId(),
                        paymentType: 'CreditCard',
                        amount: item.get('amountToRefund'),
                        paymentId: item.get('id')
                    });
                }
            }, this);
        } else {
            //this.storeCreditPanel.getValues()['refundAmount']  
            payments.push({
                orderId: this.order.getId(),
                returnId: this.record.getId(),
                paymentType: 'StoreCredit',
                amount: this.storeCreditPanel.getValues()['refundAmount']
            });
        }
        
        this.record.performPaymentAction(payments, {
            success: function (response) {
                var json = Ext.decode(response.responseText, true);

                if (!json || !json.success) {
                    return;
                }
                
                this.saveSuccess(json);
            },
            scope: me
        });
    }
});
