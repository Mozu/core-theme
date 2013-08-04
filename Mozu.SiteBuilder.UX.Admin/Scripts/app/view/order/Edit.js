
/**
 * @class Taco.view.order.Edit
 */
Ext.define('Taco.view.order.Edit', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
       'Taco.model.Order',
        'Taco.model.OrderPayment',
        'Taco.view.order.Header',
        'Taco.view.order.subform.Customer',
        'Taco.view.order.subform.Detail',
        'Taco.view.order.subform.Payment',
        'Taco.view.order.subform.Shipping'
    ],

    model: 'Taco.model.Order',

    initComponent: function (eOpts) {
        var dataTpl,
            dataCmp,
            internalNotes;

        
        if (!this.record) {
            throw ("Taco.view.order.Edit:  A record is required");
            return;
        }

        this.header = {
            title: {
                tpl: [
                    'Order No. {number} ',
                    '<span class="taco-order-status">{status}</span>'
                ],
                data: {
                    number: this.record.get('orderNumber'),
                    status: this.record.get('orderStatus')
                }
            }
        };

        this.orderHeader = Ext.create('Taco.view.order.Header', {
            renderData: this.record.getData()
        });

        
        //  TODO: Replace with ProductEdit Nav
        this.cardNav = Ext.create('Ext.container.Container', {

            // scrollable container which this component will be bound to;
            boundContainer: this,

            // target items which should be linked to and be reflected in this component as active when they are scrolled into the target area of focus.
            boundItems: [],
            
            // number of pixels 

            width: 180,
            shadow: false,
            x: 30,
            y: 20,
            floating: true,
            constrain: true,

            cls: "taco-form-card-nav-body",
            // need to override taco-form-card-nav-body to remove a negative margin in the styling of this class
            style: "margin-top: 0px;",
            
            html: '<ul><li class="taco-form-card-nav-link" targetComponentId="orderHeader">Customer Detail</li><li class="taco-form-card-nav-link" targetComponentId="orderDetail">Order Detail</li><li class="taco-form-card-nav-link"  targetComponentId="orderPayment">Payment & Billing</li><li targetComponentId="orderShipping" class="taco-form-card-nav-link">Shipment & Shipping</li><li class="taco-form-card-nav-link">RMA</li><li class="taco-form-card-nav-link">Notes & History</li></ul>',
            
            //listen for events in the cardNav widget and scroll the page to the appropriate 
            listeners: {
                afterrender: function () {
                    this.cardNav.el.on('click', function (e, target, eOpts) {
                        var wrapper,
                            targetId,
                            targetY;

                        
                        
                        wrapper = Taco.app.viewPort.down('contentbody').getEl();
                        targetId = target.getAttribute("targetComponentId");
                        if (!targetId) {
                            return;
                        }
                        var cmp = this[targetId];
                        if (cmp) {
                            targetY = cmp.el.dom.offsetTop;
                            wrapper.scrollTo('top', targetY, true);
                        }
                    }, {
                        delay:100
                    });
                },
                scope: this
            }
        });


        

        
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

        this.orderReturn = Ext.create('Taco.view.order.subform.Return', {
            itemId: "orderReturn",
            record: this.record
        });
        
        

        Ext.apply(this.body, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            cls: Taco.baseCSSPrefix + 'content-body ' + Taco.baseCSSPrefix + 'orderform',
            items: [{
                xtype: 'panel',
                manageHeight: false,
                items: [
                    this.orderHeader,
                    this.orderDetail,
                    this.orderPayment,
                    this.orderShipping,
                    this.orderReturn
                ],
                dockedItems: [{
                    xtype: 'container',
                    dock: 'left',
                    width: 200,
                    items: this.cardNav
                }]
            }]
        });
        
        
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

        // convenience method call. if your seeing this its because I checked this in by accident. woops. sorry :(
        // this.orderDetail.editOrder();
        


        //show the cardNav after the container is rendered
        this.on({
            afterrender: function () {
                this.cardNav.show();
            },
            scope: this,
            defer: 10
        });
    },

    isEdit: function () {
        return this.record.get('orderStatus') !== 'Created';
    }
});