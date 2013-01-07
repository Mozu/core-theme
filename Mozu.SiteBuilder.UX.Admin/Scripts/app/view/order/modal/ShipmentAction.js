/**
 * @class Taco.view.order.modal.ShipmentAction
 */
Ext.define('Taco.view.order.modal.ShipmentAction', {
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
            layout: {
                type: 'auto'
            },
            defaults: {
                xtype: 'textfield',
                labelSeparator: '',
                labelAlign: 'top',
                width: 644
            },
            items: [ {
                xtype: 'datefield',
                name: 'shipDate',
                fieldLabel: 'Date shipped',
                value:new Date(),
                labelAlign: 'top',
                labelSeparator: '',
                width: 128
            }, {
                name: 'shipMethod',
                fieldLabel: 'Shipping method',
                width: 300
            }, {
                name: 'shipCost',
                fieldLabel: 'Shipping cost',
                width: 128
            }, {
                name: 'trackingNumber',
                fieldLabel: 'Tracking no.',
                width: 128
            }, {
                name: 'trackingLink',
                fieldLabel: 'Link for tracking this package',
                width: 472
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
                    html: 'Ship items'
                }
            }, {
                xtype: 'component',
                autoEl: {
                    tag: 'div',
                    cls: 'order-modal-description',
                    html: '<p>Clicking "Ship" will automatically send a confirmation email to your customer listing the items that have shipped. Shipping cost is for your internal use only, your customer will not see it. Tracking info is optional and can be entered at a later time.</p>'
                }
            }, {
                xtype: 'component',
                autoEl: {
                    tag: 'h4',
                    cls: 'order-modal-subtitle',
                    html: 'Review shipment'
                }
            }, {
                xtype: 'component',
                autoEl: {
                    tag: 'div',
                    cls: 'order-modal-body'
                },
                data: this.data,
                tpl: [
                    '<tpl for=".">',
                        '<div class="taco-orderform-customer-note">',
                            '<label>Customer note:</label>',
                            '<span class="value">{shopperNotes}</span>',
                        '</div><table class="taco-orderform-cart-contents taco-flextable">',
                            '<thead><tr class="row">',
                                '<th width="80%" title="Item" data-type="text">Item</th>',
                                '<th width="20%" title="Quantity" data-type="number">Quantity</th>',
                            '</tr></thead>',
                            '<tbody><tpl for="items">',
                                '<tr class="row">',
                                    '<td width="80%" title="{product.name}" data-type="text"><tpl for="product">',
                                        '{name}<br />{productCode}',
                                    '</tpl></td>',
                                    '<td width="20%" title="{quantity}" data-type="number">{quantity}</td>',
                                '</tr>',
                            '</tbody></tpl>',
                        '</table>',
                    '</tpl>'
                ]
            },
            this.formpanel
            ]
        };

        this.primaryButton = Ext.widget('primarybutton', {
            text: 'Mark as shipped',
            onClick: function () {
                console.log('TODO: shipment action logic');
                me.fireEvent('takeajaxaction', 'shipmentaction', 'Ship');
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