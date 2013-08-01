
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

        /* TODO: move taco-orders-header-status to the scss file
         * may need to convert orderStatus to readible text if it camelcase
         */
        this.header = {
            title: 'Order No. ' + this.record.get('orderNumber') + ' <span class="' + Taco.baseCSSPrefix + 'orders-header-status" style="padding-left:20px;font-size: 0.9em; font-weight: normal;color:#d2463c">' + this.record.get("orderStatus") + '</span><br/>'
        };

        this.orderHeader = Ext.create('Taco.view.order.Header', {
            renderData: this.record.getData()
        });

        
        /*
          //
          // TODO: split this out as a seperate reusable class and create its own scss definition;
          // TODO: add support to Taco.core.ux.content.Container to utilize this by configuration;
          // TODO: add suppourt for bolding the appropriate link when the user has passed focus to the container
          // TODO: clicking on items in this container should scroll the bound container to the appropriate sub component of the bound container.
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
                        }, {
                            delay:100
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
        }, this, {
            defer:100
        });

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

        console.log(this.record.getData());
        
        
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
        //this.orderDetail.editOrder();
    }
});