
/**
 * @class Taco.view.order.Edit
 */
Ext.define('Taco.view.order.Edit', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
   //     'Taco.core.ux.BaseGrid',
       'Taco.model.Order',
        'Taco.model.OrderPayment',
        'Taco.view.order.Header',
        'Taco.view.order.subform.Detail',
        'Taco.view.order.subform.Payment',
        'Taco.view.order.subform.Shipping'
   //     'Taco.model.OrderNote',
   //     'Taco.store.OrderNotes',
   //     'Taco.view.order.modal.Address', 'Taco.view.order.modal.PaymentAction', 'Taco.view.order.modal.ShipmentAction', 'Taco.model.PaymentAndCheckout', 'Ext.grid.feature.Grouping'
    ],

    model: 'Taco.model.Order',

    initComponent: function (eOpts) {
        var me = this,
            dataTpl, dataCmp, internalNotes;

        
        if (!this.record) {
            throw ("Taco.view.order.Edit:  A record is required");
            return;
        }

        // todos move taco-orders-header-status to the scss file
        // may need to convert orderStatus to readible text if it camelcase
        this.header = {
            title: 'Order No. ' + this.record.get('orderNumber') + ' <span class="' + Taco.baseCSSPrefix + 'orders-header-status" style="padding-left:20px;font-size: 0.9em; font-weight: normal;color:#d2463c">' + this.record.get("orderStatus") + '</span><br/>'
        };

        this.orderHeader = Ext.create('Taco.view.order.Header', {
            renderData: this.record.getData()
        });

        
        /*
          // TODOs:
          // split this out as a seperate reusable class and create its own scss definition;
          // add support to Taco.core.ux.content.Container to utilize this by configuration;
          // add suppourt for bolding the appropriate link when the user has passed focus to the container
          // clicking on items in this container should scroll the bound container to the appropriate sub component of the bound container.
          // 
        */
        this.cardNav = Ext.create('Ext.container.Container', {

            // scrollable container which this component will be bound to;
            boundContainer: me,

            // target items which should be linked to and be reflected in this component as active when they are scrolled into the target area of focus.
            boundItems: [],
            
            // number of pixels 

            width: 180,
            shadow:false,
            x: 30,
            y:20,
            floating: true,
            constrain: true,

            cls: "taco-form-card-nav-body",
            // need to override taco-form-card-nav-body to remove a negative margin in the styling of this class
            style: "margin-top: 0px;",
            
            
            
            listeners: {
                afterrender: {
                    fn: function () {
                        me.cardNav.el.on('click', function (e, target, eOpts) {
                            var wrapper,
                                targetId,
                                targetY;

                            
                            
                            wrapper = Taco.app.viewPort.down('contentbody').getEl();
                            targetId = target.getAttribute("targetComponentId");
                            if (!targetId) {
                                return;
                            }
                            var cmp = me[targetId];
                            if (cmp) {
                                targetY = cmp.el.dom.offsetTop;
                                wrapper.scrollTo('top', targetY, true);
                            }
                        });
                    },
                     scope:me
                }
            },
            html: '<ul><li class="taco-form-card-nav-link" targetComponentId="orderHeader">Customer Detail</li><li class="taco-form-card-nav-link" targetComponentId="orderDetail">Order Detail</li><li class="taco-form-card-nav-link"  targetComponentId="orderPayment">Payment & Billing</li><li targetComponentId="orderShipping" class="taco-form-card-nav-link">Shipment & Shipping</li><li class="taco-form-card-nav-link">RMA</li><li class="taco-form-card-nav-link">Notes & History</li></ul>'
        });
        //listen for events in the cardNav widget and scroll the page to the appropriate 


        

        
        this.orderDetail = Ext.create('Taco.view.order.subform.Detail', {
            itemId: "orderDetails",
            record: this.record
        });
        
        this.orderPayment = Ext.create('Taco.view.order.subform.Payment', {
            itemId: "orderPayment",
            record: this.record
        });

        
        this.orderShipping= Ext.create('Taco.view.order.subform.Shipping', {
            itemId: "orderShipping",
            record: this.record
        });

        
        //show the cardNav after the container is rendered
        this.on('afterrender', function () {
            this.cardNav.show();
        }, this);

        Ext.apply(me.body, {
            items: [{
                xtype: 'panel',
                manageHeight: false,
                items: [
                    this.orderHeader,
                    this.orderDetail,
                    this.orderPayment,
                    this.orderShipping
                ],
                dockedItems: [{
                    xtype: 'container',
                    dock: 'left',
                    width: 200,
                    items: this.cardNav
                }]
            }],
            layout: { type: 'vbox', align: 'stretch' },
            cls: Taco.baseCSSPrefix + 'content-body ' + Taco.baseCSSPrefix + 'orderform'
        });
        
        console.log(this.record.getData())
        
        
        // load the shipping rates data for use in the shipping packages
        Ext.namespace("Taco.properties");
        Taco.properties.shippingRates = Taco.core.data.StoreManager.getOrCreate({
            model: 'Taco.model.KeyValuePair',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                api: {
                    read: '/admin/app/shipping/carrierRates'
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: "message"
                }
            }
        });

        this.callParent(arguments);

    }
});




/**
 * @class Taco.view.order.Edit
 */
/*
Ext.define('Taco.view.order.Edit', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.BaseGrid',
        'Taco.model.Order',
        'Taco.model.OrderNote',
        'Taco.store.OrderNotes',
        'Taco.view.order.modal.Address', 'Taco.view.order.modal.PaymentAction', 'Taco.view.order.modal.ShipmentAction', 'Taco.model.PaymentAndCheckout', 'Ext.grid.feature.Grouping'],

    model: 'Taco.model.Order',

    initComponent: function (eOpts) {
        var me = this,
            dataTpl, dataCmp, internalNotes;

        this.paymentFlow = {
            authorize: 'placement',
            capture: 'shipment'
        };

        this.notesStore = Ext.create('Taco.store.OrderNotes');

        this.data = this.recordId.getData(true);
        console.log("order data object", this.data);

        this.header = {
            title: 'Order #' + this.recordId.get('orderNumber') + ' <span style="font-size: 0.5em; font-weight: normal;">(' + this.recordId.getId() + ')</span>'
        };

        dataTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="taco-orderform-customer-data">',
                    '<div class="taco-orderform-header">',
                        '<div>',
                            '<div class="status order-status">{orderStatus}</div>',
                            '<div class="order-total">{total:usMoney}</div>',
                        '</div><div class="customer-info">',
                            '<div>{createDate:date("F j, Y g:i a")}</div>',
                                '<div><label>Customer ID:</label>',
                                '<span class="value">{customerAccountId}</span>',
                            '</div><!--<div>',
                                '<label>IP address:</label>',
                                '<span class="value">{ipAddress}</span>',
                            '</div>-->',
                        '</div>',
                    '</div><div class="taco-orderform-merchant-actions">',
                        '<div class="order-authorization">',
                            '<div class="status payment-status">{paymentStatus}</div>',
                            '<div>',
                                '<tpl for="payment"><tpl for="card">',
                                    '<label>{paymentOrCardType}</label>',
                                    '<span class="value">{cardNumberPartOrMask}</span>',
                                '</tpl></tpl>',
                            '</div><div>',
                                '<tpl for="paymentTransactions">',
                                    '<label>Authorization id:</label>',
                                    '<span class="value">{id}</span>',
                                '</tpl>',
                            '</div><div>',
                                '<a href="#">Change payment method</a>',
                            '</div><div class="payment-flow-action">',
                                '<tpl if="this.hasAction(availablePaymentActions, \'receivecheck\')">',
                                    '<a href="#" data-editor="paymentAction">Receive {total:usMoney}</a>',
                                '<tpl elseif="this.hasAction(availablePaymentActions, \'capture\')">',
                                    '<a href="#" data-editor="paymentAction">Capture {total:usMoney}</a>',
                                '</tpl>',
                            '</div>',
                        '</div><div class="order-shipping">',
                            '<div class="status shipping-status">{fulfillmentStatus}</div>',
                            '<tpl for="shipment">',
                                '<div>{shippingMethodCode}</div>',
                            '</tpl><div class="payment-flow-action">',
                                '<tpl if="this.hasAction(availableShipmentActions, \'Ship\')">',
                                    '<a href="#" data-editor="shipmentAction">Ship all items</a>',
                                '</tpl>',
                            '</div>',
                        '</div>',
                    '</div><div class="taco-orderform-addresses">',
                        '<div class="order-address order-address-billing">',
                            '<div class="order-address-header">',
                                '<label>Billing to</label>',
                                // '<a href="#" data-editor="billingAddress">Edit</a>',
                            '</div>',
                            '<tpl for="payment"><tpl for="card"><tpl for="billingAddress">',
                                '<div class="order-address-body">',
                                    '<div>{firstName} {lastName}</div>',
                                    '<div class="order-address-data"><tpl for="address">',
                                        '<div>{address1}</div>',
                                        '<div>{address2}</div>',
                                        '<div>{address3}</div>',
                                        '<div>{cityOrTown} {stateOrProvince} {postalOrZipCode}</div>',
                                        '<div>{countryCode}</div>',
                                    '</tpl></div>',
                                    '<div><a href="mailto:{email}">{email}</a></div>',
                                    '<tpl foreach="phoneNumbers">',
                                        '<div>{.}</div>',
                                    '</tpl>',
                                '</div>',
                            '</tpl></tpl></tpl>',
                        '</div><div class="order-address order-address-shipping">',
                            '<div class="order-address-header">',
                                '<label>Shipping to</label>',
                                '<a href="#" data-editor="shippingAddress">Edit</a>',
                            '</div>',
                            '<tpl for="shipment"><tpl for="shippingAddress">',
                                '<div class="order-address-body">',
                                    '<div>{firstName} {lastName}</div>',
                                    '<div class="order-address-data"><tpl for="address">',
                                        '<div>{address1}</div>',
                                        '<div>{address2}</div>',
                                        '<div>{address3}</div>',
                                        '<div>{cityOrTown} {stateOrProvince} {postalOrZipCode}</div>',
                                        '<div>{countryCode}</div>',
                                    '</tpl></div>',
                                    '<div><a href="mailto:{email}">{email}</a></div>',
                                    '<tpl foreach="phoneNumbers">',
                                        '<div>{.}</div>',
                                    '</tpl>',
                                '</div>',
                            '</tpl></tpl>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="taco-orderform-heading">Order Details</div>',
                '<div class="taco-orderform-customer-note">',
                    '<label>Customer note:</label>',
                    '<span class="value">{shopperNotes}</span>',
                '</div><table class="taco-orderform-cart-contents taco-flextable">',
                    '<thead><tr class="row">',
                        '<th width="35%" title="Item" data-type="text">Item</th>',
                        '<th width="15%" title="Price" data-type="number">Price</th>',
                        '<th width="20%" title="Price after discount" data-type="number">Price after discount</th>',
                        '<th width="15%" title="Quantity" data-type="number">Quantity</th>',
                        '<th width="15%" title="Title" data-type="number">Total</th>',
                    '</tr></thead>',
                    '<tbody><tpl for="items">',
                        '<tr class="row">',
                            '<td width="35%" title="{product.name}" data-type="text"><tpl for="product">',
                                '{name}<br />{productCode}',
                            '</tpl></td>',
                            '<td width="15%" title="{product.price.price:usMoney}" data-type="number">{product.price.price:usMoney}</td>',
                            '<td width="20%" title="{product.price.salePrice:usMoney}" data-type="number">{product.price.salePrice:usMoney}</td>',
                            '<td width="15%" title="{quantity}" data-type="number">{quantity}</td>',
                            '<td width="15%" title="{subTotal:usMoney}" data-type="number">{total:usMoney}</td>',
                        '</tr>',
                    '</tbody></tpl>',
                '</table>',
                '<ul class="taco-orderform-totals">',
                    '<li class="subtotal">',
                        '<label>Subtotal:</label>',
                        '<span class="value">{[Ext.util.Format.usMoney(values.subTotal - values.discountTotal)]}</span>',
                    '</li><li class="tax-total">',
                        '<label>Tax:</label>',
                        '<span class="value">{taxTotal:usMoney}</span>',
                    '</li><li class="shipping-total">',
                        '<label>Shipping:</label>',
                        '<span class="value">{shippingTotal:usMoney}</span>',
                    '</li><li class="grand-total">',
                        '<label>Total:</label>',
                        '<span class="value">{total:usMoney}</span>',
                    '</li>',
                '</ul>',
                '<div class="taco-orderform-heading">Internal Notes</div>',
            '</tpl>',
            {
                hasAction: function (available, action) {
                    return Ext.Array.contains(available, action);
                }
            }
        );

        dataCmp = Ext.create('Ext.Component', {
            data: this.data,
            tpl: dataTpl,
            listeners: {
                scope: this,
                click: {
                    element: 'el',
                    fn: function (e, t) {
                        var editor = t.getAttribute('data-editor');

                        if (!Ext.isEmpty(editor)) {
                            this.beginEditor(editor);
                        }
                    }
                }
            }
        });

        internalNotes = Ext.create('Ext.Container', {
            xtype: 'container',
            cls: Taco.baseCSSPrefix + 'orderform-internal-notes',
            items: [{
                xtype: 'container',
                cls: 'note-form',
                items: [{
                    xtype: 'textarea',
                    grow: true,
                    emptyText: 'add a note',
                    allowOnlyWhitespace: false,
                    width: '100%'
                }, {
                    xtype: 'button',
                    text: 'Add note',
                    handler: function (button, e) {
                        me.fireEvent('addnote', button, e);
                    }
                }]
            }, {
                xtype: 'gridpanel',
                store: this.notesStore,
                hideHeaders: true,
                viewConfig: {
                    stripeRows: false
                },
                features: [{
                    ftype: 'grouping',
                    collapsible: false,
                    groupHeaderTpl: ['{groupValue:this.formatName}', {
                        formatName: function (name) {
                            return Ext.Date.format(name, 'F j, Y');
                        }
                    }]
                }],
                columns: [{
                    xtype: 'datecolumn',
                    dataIndex: 'createDate',
                    text: 'Timestamp',
                    align: 'right',
                    format: 'h:i a',
                    width: 140
                }, {
                    dataIndex: 'text',
                    text: 'Note',
                    flex: 5
                }, {
                    dataIndex: 'createByName',
                    text: 'Author',
                    flex: 1
                }]
            }]
        });

        this.tplComponents = [dataCmp];

        Ext.apply(me.body, {
            items: [dataCmp, internalNotes],
            layout: { type: 'auto' },
            cls: Taco.baseCSSPrefix + 'content-body ' + Taco.baseCSSPrefix + 'orderform'
        });

        this.callParent(arguments);

        this.notesStore.getProxy().setExtraParam('orderId', this.data.id);
        this.notesStore.load({
            callback: function () { console.log('notesStore loaded'); }
        });

        this.on({
            addnote: {
                fn: this.addNote,
                scope: this
            }
        });
    },

    addNote: function (button) {
        var me = this,
            ta = button.up('container').down('textarea'),
            text;

        if (ta.isValid()) {
            text = ta.getValue();
        } else {
            return;
        }

        this.notesStore.add({ text: text });
    },

    beginEditor: function (fieldName) {
        var me = this,
            modalClass = false,
            url, key;

        switch (fieldName) {
            case 'billingAddress':
            case 'shippingAddress':
                modalClass = 'Taco.view.order.modal.Address';
                break;
            case 'paymentAction':
                if (this.data.paymentStatus === 'AwaitingCheck') {
                    modalClass = 'Taco.view.order.modal.PaymentAction';
                } else {
                    url = 'paymentaction';
                    key = 'capture';
                }
                break;
            case 'shipmentAction':
                if (this.data.fulfillmentStatus === 'NotFulfilled') {
                    modalClass = 'Taco.view.order.modal.ShipmentAction';
                } else {
                    url = 'shipmentaction';
                    key = 'Ship';
                }
            default:
                break;
        }

        if (modalClass) {
            Ext.destroy(this.modal);
            this.modal = Ext.create(modalClass, {
                data: this.data,
                field: fieldName,
                listeners: {
                    'updatetemplate': {
                        fn: this.updateTemplate,
                        scope: this
                    },
                    'takeajaxaction': {
                        fn: this.takeAjaxAction,
                        scope: this
                    }
                }
            });
        } else {
            this.takeAjaxAction(url, key);
        }
    },

    takeAjaxAction: function (urlFragment, key) {
        var me = this,
            currentlyValidKeys = ['receivecheck', 'capture', 'Ship'];

        console.log(key, currentlyValidKeys);
        if (!Ext.Array.contains(currentlyValidKeys, key)) { return; }

        Ext.Ajax.request({
            url: '/admin/app/order/' + urlFragment,
            method: "GET",
            params: {
                orderId: me.data.id,
                action: key
            },
            success: function (response) {
                var res = Ext.JSON.decode(response.responseText),
                    instance;

                if (Ext.isEmpty(res.items)) return;

                if (res.items.id === me.data.id) {
                    instance = Ext.create('Taco.model.Order', res.items);
                    me.updateTemplate(instance.getData());
                    instance.destroy();
                }
            },
            failure: function (response) {
                console.log('failure');
            }
        });
    },

    updateTemplate: function (data) {
        var me = this;

        console.log('updatetemplate called');
        Ext.Array.each(this.tplComponents, function (cmp) {
            cmp.update(data);
        }, this);
    }
});

*/
