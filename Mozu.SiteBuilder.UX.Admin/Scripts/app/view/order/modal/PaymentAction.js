/**
 * @class Taco.view.order.modal.PaymentAction
 */
Ext.define('Taco.view.order.modal.PaymentAction', {
    extend: 'Taco.core.ux.modal.Modal',

    cls: Taco.baseCSSPrefix + 'order-modal',
    autoShow: true,
    width: 700,
    data: {},
    field: '',

    initComponent: function (eOpts) {
        var me = this;

        this.formpanel = Ext.create('Ext.form.Panel', {
            xtype: 'formpanel',
            bodyCls: Taco.baseCSSPrefix + 'flexform',
            layout: { type: 'auto' },
            defaults: {
                xtype: 'textfield',
                labelSeparator: '',
                labelAlign: 'top',
                width: 644
            },
            items: [{
                name: 'checkNumber',
                fieldLabel: 'Check Number',
                width: 300
            }, {
                name: 'checkDate',
                fieldLabel: 'Date',
                width: 300
            }, {
                xtype: 'textarea',
                name: 'receiptNote',
                fieldLabel: 'Note',
                grow: false,
                emptyText: 'add a note',
                allowOnlyWhitespace: false
            }],
            listeners: {
                afterrender: function (panel) {
                    Ext.destroy(panel.getLayout().clearEl);
                }
            }
        });

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'h2',
                    cls: 'order-modal-title',
                    html: 'Receive check'
                }
            }, {
                xtype: 'component',
                autoEl: {
                    tag: 'div',
                    cls: 'order-modal-description',
                    html: '<p>Enter any information to record along with the receipt of this check.</p>'
                }
            },
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Update',
            onClick: function () {
                console.log('TODO: payment action logic');
                me.fireEvent('takeajaxaction', 'paymentaction', 'receivecheck');
                me.hide();
            }
        });

        this.actions = {
            xtype: 'container',
            items: [this.primaryButton, {
                xtype: 'action',
                text: 'Cancel',
                onClick: function () {
                    me.hide();
                }
            }]
        };

        this.callParent(arguments);
    }
});