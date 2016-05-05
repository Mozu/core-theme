/**
 * @class Taco.view.order.modal.AddPurchaseOrder
 */
Ext.define('Taco.view.order.modal.AddPurchaseOrder', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField',
        'Taco.shared.view.form.Address',
        'Taco.core.ux.form.TextField',
        'Taco.view.order.widget.ReusePaymentPickerField'
    ],

    scale: 'large',
    title: 'Create Purchase Order',
    models: ['Taco.model.CheckoutSettings'],

    layout: "anchor",
    isLoading: false,

    primaryText: 'Done',

    initComponent: function () {
        var balance = this.getBalance(),
            limit = this.getLimit(),
            terms = this.getTerms();

        this.form = Ext.create('Ext.form.Panel', {
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        balance,
                        limit,
                        terms
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            allowBlank: false,
                            fieldLabel: 'Purchase Order #',
                            flex: 1,
                            name: 'purchaseOrderNumber',
                            xtype: 'textfield'
                        },
                        {
                            allowBlank: false,
                            currencyCode: this.record.getCurrencyCode(),
                            fieldLabel: 'Amount',
                            flex: 1,
                            margin: '0 0 0 30',
                            name: 'amount',
                            value: this.record.formatCurrency(this.record.get('total')),
                            xtype: 'textfield'
                        }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            fieldLabel: 'Department Code',
                            flex: 1,
                            name: 'departmentCode',
                            xtype: 'textfield'
                        },
                        {
                            allowBlank: false,
                            fieldLabel: 'Department ID',
                            flex: 1,
                            margin: '0 0 0 30',
                            name: 'departmentId',
                            xtype: 'textfield'
                        }
                    ]
                }
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    getBalance: function () {
        var availableBalance = 7099;    // todo: = this.record.get('availableBalance');

        return Ext.widget({
            anchor: 0,
            autoEl: {
                html: '<p>Available Balance</p>'
                    + '<br />'
                    + '<p>'
                    + this.record.formatCurrency(availableBalance)
                    + '</p>'
            },
            flex: 1,
            itemId: 'availableBalance',
            margin: '20 0 10 0',
            xtype: 'box'
        });
    },

    getLimit: function () {
        var creditLimit = 10000;    // todo: = this.record.get('creditLimit');

        return Ext.widget({
            flex: 1,
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'creditLimit',
            autoEl: {
                html: '<p>Credit Limit</p>'
                    + '<br />'
                    + '<p>'
                    + this.record.formatCurrency(creditLimit)
                    + '</p>'
            }
        });
    },

    getTerms: function () {
        var netTerms = ['30 Days', '60 Days'],   // todo: = this.record.get('netTerms'),
            netTermsItem = netTerms[0];

        /*
         * If Net Terms is only one item, show it as a static string
         * Otherwise, show a dropdown with each option
         */
        if (netTerms.length > 1) {
            return Ext.widget({
                fieldLabel: 'Net Terms',
                flex: 1,
                forceSelection: true,
                name: 'netTerms',
                store: netTerms,
                xtype: 'selectfield'
            });
        }

        return Ext.widget({
            flex: 1,
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'netTerms',
            autoEl: {
                html: '<p>Net Terms</p>'
                    + '<br />'
                    + '<p>'
                    + netTermsItem
                    + '</p>'
            }
        });
    },

    doSave: function () {
        var me = this,
            data = this.form.getValues();

        data.orderId = this.record.getId();

        me.setLoading({
            msg: "Saving"
        }, me.body);

        this.record.addPurchaseOrder({
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true),
                    data;

                if (!json) { return }

                data = json.items;
                me.record.reload();
                me.saveSuccess(data);
            },
            failure: function () {
                me.setLoading(false, me.body);
            }
        });
    }
});