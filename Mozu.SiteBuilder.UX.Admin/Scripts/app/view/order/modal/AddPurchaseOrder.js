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

    layout: 'anchor',
    isLoading: false,

    primaryText: 'Done',

    initComponent: function () {

        var me = this,
            balance = me.getBalance(7099),
            limit = me.getLimit(10000),
            terms = me.record.checkoutSettings.get('purchaseOrder').netTerms
                    ? me.getTerms(me.record.checkoutSettings.get('purchaseOrder').netTerms)
                    : me.getTerms(['No terms specified']),
            fields = me.record.checkoutSettings.get('purchaseOrder').memoFields
                     ? me.getFields(me.record.checkoutSettings.get('purchaseOrder').memoFields)
                     : me.getFields([]);

        me.form = Ext.create('Ext.form.Panel', {
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
                            currencyCode: me.record.getCurrencyCode(),
                            fieldLabel: 'Amount',
                            flex: 1,
                            margin: '0 0 0 30',
                            name: 'amount',
                            value: me.record.formatCurrency(me.record.get('total')),
                            xtype: 'textfield'
                        }
                    ]
                },
                {
                    items: fields,
                    layout: {
                        align: 'stretch',
                        type: 'vbox'
                    },
                    xtype: 'fieldcontainer'
                }
            ]
        });

        me.items = [me.form];

        this.callParent(arguments);
    },

    getBalance: function (balance) {
        var content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Available Balance',
                        tag: 'p'
                    },
                    {
                        html: this.record.formatCurrency(balance),
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

    getLimit: function (limit) {
        var content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Credit Limit',
                        tag: 'p'
                    },
                    {
                        html: this.record.formatCurrency(limit),
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

    getTerms: function (terms) {
        var netTermsSelect = null,
            netTermsItem = terms[0],
            content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Net Terms',
                        tag: 'p'
                    },
                    {
                        html: netTermsItem,
                        tag: 'p'
                    }
                ],
                tag: 'span'
            };

        /**
         * If Net Terms is only one item, show it as a static string
         * Otherwise, show a select input with each option
         */
        if (terms.length > 1) {
            return Ext.widget({
                fieldLabel: 'Net Terms',
                flex: 1,
                forceSelection: true,
                name: 'netTerms',
                store: terms,
                xtype: 'selectfield'
            });
        }

        return Ext.widget({
            flex: 1,
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'netTerms',
            autoEl: content
        });
    },

    getFields: function (fields) {
        var extraFields = [],
            childFields = [],
            fieldMargin = '0 0 0 0';

        /**
         * Iterate through extra fields, build array to display
         */
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

        return extraFields;
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