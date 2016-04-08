/**
 * @class Taco.view.order.Storefront
 */
Ext.define('Taco.view.order.Storefront', {
    extend: 'Ext.panel.Panel',
    mixins: {

        navHeader: 'Taco.core.ux.mixins.NavHeader'

    },
    requires: [

        'Ext.ux.IFrame',
        'Taco.core.ux.action.Action'

    ],
    customerId: null,
    orderId: null,
    title: 'thing dooer',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    checkoutRe: /^\/checkout\/[a-f0-9]{32}/gi,
    cartFormRe: /cart\/checkout/i,
    layout: {
        type: 'fit'
    },
    padding: '0 0 0 0',
    url: '/',
    enableSearchBarInHeader: false,

    initComponent: function() {
        var me = this;
        this.mixins.navHeader.init.apply(this);

        me.items = [{
            xtype: 'panel',
            bodyStyle: {
                'border-width': '0px 1px 0px 0px'
            },
            layout: {
                type: 'fit'
            },
            items: [{
                    xtype: 'panel',
                    itemId: 'editorCardPanel',
                    region: 'center',

                    layout: {
                        type: 'vbox', // Arrange child items vertically
                        align: 'stretch', // Each takes up full width
                        padding: 5
                    },
                    dockedItems: this.getSubheader(),
                    items: [{
                        xtype: 'component',
                        itemId: 'leftIframeOffset',
                        width: 0
                    }, {
                        flex: 1,
                        itemId: 'iframe',
                        xtype: 'uxiframe',
                        cls: 'taco-website-iframe',
                        listeners: {
                            load: this.onIframeLoad,
                            scope: this
                        },

                        src: this.getStartUrl()
                    }, {
                        xtype: 'component',
                        itemId: 'rightIframeOffset',
                        width: 0
                    }]
                }

            ]

        }];

        this.callParent(arguments);
        this.iframe = this.down('#iframe');

      
       Taco.model.CustomerAccount.load(me.customerId, {
                success: function (record, op) {
                   me.customer = record;
                   me.setTitle( 'Order for ' + record.get('firstNameSafe') + ' ' + record.get('lastNameSafe'));
               }
           });


    },

    onIframeLoad: function() {
        var me = this,
            doc = me.iframe.getDoc(),
            cart = me.getCartData();

        if (me.checkoutRe.exec(doc.location.pathname)) {
            var orderId = doc.location.pathname.substring(10);
            me.onCheckoutPage(orderId);
            return;
        }
        if (cart) {
            Ext.Array.each(doc.getElementsByTagName('form'), function(form) {
                if (me.cartFormRe.test(form.action)) {
                    Ext.fly(form).on('submit', function(e) {
                      
                        e.preventDefault();
                        e.stopPropagation();
                        me.onCheckoutSubmit(cart.id);
                    });
                }
            });
        }
        // setTimeout(index.pollDoc, 100, index);
    },


    getStartUrl: function() {
        return '/_gosite/' + Taco.app.context.getSiteId() + '?environment=admin&redir=' + encodeURIComponent(Ext.String.urlAppend(this.url, 'isAdminMode=true&mz_cust_impersonate=' + this.customerId));
    },

    getSubheader: function() {

        return {
            xtype: 'toolbar',
        };

    },
    onSave : function (){
        var me = this;

        me.iframe.getWin().require(['modules/api'] , function(api){
            api.post('cart').then ( function (resp){ 
                if ( resp.data.items.length ){
                    me.onCheckoutSubmit( resp.data.id);
                }else{
                    me.onCancel();
                }
            });
        });
        
    },
    onCancel: function (){
        var me = this;
        Taco.core.StateManager.attemptNavigate('/orders/edit/'+ me.orderId);
    },
    getCartData: function() {
        var script = this.iframe.getDoc().getElementById('data-mz-preload-cart');
        var text;
        if (script) text = script.textContent || script.innerText || script.text || script.innerHTML;
        if (text) return text && JSON.parse(text);
    },
    onCheckoutSubmit: function(cartId) {
         var me = this;





        me.setLoading();
        Ext.Ajax.request({
            url: '/admin/app/order/addCartToOrder',
            method: 'POST',
            jsonData: {
                OrderId: me.orderId,
                CustomerAccountId: me.customerId,
                CartId: cartId
            },
            success: function(record) {
                me.setLoading(false);
                Taco.core.StateManager.attemptNavigate('/orders/edit/' + JSON.parse(record.responseText).items);
            },
            failure: function() {
                me.setLoading(false);
                alert('error editing  order');
               // Taco.core.StateManager.attemptNavigate('/orders/edit/' + record.id);
            }

        });
    },
    onCheckoutPage: function(newOrderId) {
        var me = this;
        if (me.customerId) {
            me.setLoading();
            Ext.Ajax.request({
                url: '/admin/app/order/setcustomer',
                method: 'POST',
                jsonData: {
                    OrderId: newOrderId,
                    CustomerAccountId: me.customerId
                },
                success: function(record) {
                    me.setLoading(false);
                    Taco.core.StateManager.attemptNavigate('/orders/edit/' + newOrderId);
                },
                failure: function() {
                    me.setLoading(false);
                    alert('ooops - setCustomer');
                    Taco.core.StateManager.attemptNavigate('/orders/edit/' + newOrderId);
                }

            });
        } else {
            Taco.core.StateManager.attemptNavigate('/orders/edit/' + newOrderId);
        }
        return;
    }

    //pollDoc : function (index, delay){
    //    index = index || this;
    //    var doc = index.iframe.getDoc();
    //    if( doc && doc.location.hostname)
    //    {
    //        console.log( doc.location.hostname)
    //    }
    //    if ( !delay &&  doc && doc.location.hostname && doc.readyState === 'complete' ) {
    //        index.onPageLoad();
    //    }else{
    //        delay = delay || 100;
    //        setTimeout( index.pollDoc, delay , index );
    //    }
    //
    //
    //},
    //setIFrameLocation: function(config) {
    //
    //    var url = Ext.String.urlAppend(config.url, 'isAdminMode=true&cb='+ new Date().getTime()),
    //        emailQueryParams = window.emailParams;
    //
    //    if (emailQueryParams) {
    //        url += '&queryParams=' + JSON.stringify(emailQueryParams);
    //    }
    //
    //    this.iframe.getWin().location.href = url;
    //
    //    this.pollDoc( this,200);
    //},
    //onPageLoad: function (editor) {
    //    console.log('adding events');
    //    Ext.EventManager.on(this.iframe.getWin(), 'unload', function ( e, target){
    //        console.log('unload doing');
    //    });
    //
    //    Ext.EventManager.on(this.iframe.getWin(), 'beforeunload', function ( e, target){
    //        console.log('beforeunload doing');
    //    });
    //
    //    Ext.EventManager.on(this.iframe.getDoc(), 'click', function (e, target) {
    //
    //
    //        if (!e.browserEvent.defaultPrevented) {
    //            //me.fireEvent('beforeIframeClickNavigate', {
    //            //    url: target.pathname + target.search,
    //            //    fullUrl:target.href
    //            //});
    //
    //            this.navigate({
    //                url: target.href
    //            });
    //
    //            e.stopEvent();
    //        }
    //    }, this, {
    //        delegate: 'a'
    //    });
    //},
    //
    //navigate: function (config) {
    //
    //
    //    console.log( 'naving to', config.url);
    //    var parser = document.createElement('a');
    //    parser.href = config.url;
    //
    //
    //    // not a real way to tell if a non http/https url is relative
    //    if (parser.hostname && (parser.hostname ).toLowerCase() !== ( window.location.hostname || '').toLowerCase()) {
    //        Ext.Msg.alert('Attention', 'editing of url [<b><a href="' + parser.href + '" target="_blank">' + parser.href + '</a></b>] not supported');
    //        return;
    //    }
    //
    //    config.url = parser.pathname + parser.search;
    //
    //    if (config.url.length && config.url[0] !== '/') {
    //        config.url = '/' + config.url;
    //    }
    //
    //    this.fireEvent('navigatestart', this, config);
    //    //  this.showHideButtons([]);
    //    this.url = config.url;
    //
    //
    //
    //    this.setIFrameLocation(config);
    //
    //    // Taco.core.StateManager.addState('website/page' + config.url);
    //
    //
    //
    //
    //
    //
    //},

});
