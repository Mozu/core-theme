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
            terms = this.getTerms(),
            fields = [
                {
                    code: 'department-code',
                    enabled: true,
                    label: 'Department Code',
                    required: false
                },
                {
                    code: 'department-id',
                    enabled: true,
                    label: 'Department ID',
                    required: true
                }
            ],  // todo: = this.record.get('purchaseOrder').extraFields
            extraFields = [],
            fieldMargin = '0 0 0 0';

        /**
         * Iterate through extra fields, build array to display
         */

        var childFields = [];

        fields.forEach(function (field) {
            if (field.enabled) {

                /**
                 * If the field is not the left-most field, add left padding
                 */

                if (childFields.length > 0) {
                    fieldMargin = '0 0 0 30';
                }

                var newField = {
                    allowBlank: !field.required,
                    fieldLabel: field.label,
                    flex: 1,
                    margin: fieldMargin,
                    name: field.code,
                    xtype: 'textfield'
                };

                childFields.push(newField);

                if (childFields.length == 3) {
                    extraFields.push({
                        items: childFields,
                        layout: 'hbox',
                        xtype: 'fieldcontainer'
                    });
                    childFields = [];
                    fieldMargin = '0 0 0 0';
                }
            }
        });

        if (childFields.length) {
            extraFields.push({
                items: childFields,
                layout: 'hbox',
                xtype: 'fieldcontainer'
            });
        }

        this.form = Ext.create('Ext.form.Panel', {
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    flex: 1,
                    items: [
                        balance,
                        limit,
                        terms,
                        {
                            flex: 3
                        }
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
                    items: extraFields,
                    layout: {
                        align: 'stretch',
                        type: 'vbox'
                    },
                    xtype: 'fieldcontainer'
                }
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    getBalance: function () {
        var availableBalance = 7099,    // todo: = this.record.get('purchaseOrder').availableBalance;
            content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Available Balance',
                        tag: 'p'
                    },
                    {
                        html: this.record.formatCurrency(availableBalance),
                        tag: 'h2'
                    }
                ],
                tag: 'span'
            };

        return Ext.widget({
            anchor: 0,
            autoEl: content,
            flex: 1,
            itemId: 'availableBalance',
            margin: '20 0 10 0',
            xtype: 'box'
        });
    },

    getLimit: function () {
        var creditLimit = 10000,    // todo: = this.record.get('purchaseOrder').creditLimit;
            content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Credit Limit',
                        tag: 'p'
                    },
                    {
                        html: this.record.formatCurrency(creditLimit),
                        tag: 'h2'
                    }
                ],
                tag: 'span'
            };

        return Ext.widget({
            flex: 1,
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'creditLimit',
            autoEl: content
        });
    },

    getTerms: function () {
        var netTerms = ['30 Days', '60 Days'],   // todo: = this.record.get('purchaseOrder').netTerms,
            netTermsItem = netTerms[0];

        /*
         * If Net Terms is only one item, show it as a static string
         * Otherwise, show a select input with each option
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