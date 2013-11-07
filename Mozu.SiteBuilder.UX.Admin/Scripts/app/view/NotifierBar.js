/**
 * @class Taco.view.NotifierBar
 */
    Ext.define('Taco.view.NotifierBar', {
        extend: 'Taco.core.ux.window.Window',
        alias: 'widget.notifierbar',

        bodyPadding: '9 10 9 10',
        closeAction: 'destroy',
        header: false,
        height: 'auto',
        minHeight: 40,
        overflowY: 'hidden',
        ui: 'modal',
        width: '75%',
        y: 108,

        layout: {
            type: 'fit'
        },

        initComponent: function () {
            var tpl;

            this.cls = 'taco-notifierbar taco-notifierbar-' + this.messageType;

            tpl = new Ext.XTemplate('<span class="status-icon"></span><span class="message">{message}</span><span class="close-icon"></span>');

            this.items = [{
                xtype: 'component',
                padding: '0 30 0 30',
                tpl: tpl,
                data: {
                    message: this.message
                },
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: function (e, t) {
                            if (e.getTarget('.close-icon', 10)) {
                                this.close();
                            }
                        }
                    }
                }
            }];

            this.callParent(arguments);
        }
       
        // cls: Taco.baseCSSPrefix + 'notifierbar',

        // hideMode: 'visibility',
        // hidden: true,

        // downCls: Taco.baseCSSPrefix + 'notifierbar-down',

        // tpl: new Ext.XTemplate(
        //     '<ul>',
        //     '<tpl for=".">',
        //         '<li class="' + Taco.baseCSSPrefix + 'message-{type}"><span class="' + Taco.baseCSSPrefix + 'message-icon">&nbsp;</span>{message}</li>',
        //     '</tpl>',
        //     '</ul>',
        //     '<a class="' + Taco.baseCSSPrefix + 'notifierbar-dismiss" href="#">OK</a>'
        // ),

        // slideDown: function () {
        //     var me = this;
            
        //     me.show();
        //     me.el.animate({
        //         duration: 250,
        //         easing: "easeOut",
        //         to: {
        //             top: -40,
        //             opacity: 1
        //         },
        //         listeners: {
        //             afteranimate: function () {
        //                 me.el.down("a").focus();
        //             },
        //             scope: me
        //         }
        //     });
        // },

        // slideUp: function () {
        //     this.el.animate({
        //         duration: 250,
        //         easing: "easeOut",
        //         to: {
        //             top: -(this.el.getHeight() + 25),
        //             opacity: 0
        //         },
        //         listeners: {
        //             afteranimate: function() {
        //                 this.hide();
        //             },
        //             scope: this
        //         }
        //     });
        // },

        // initComponent: function () {
        //     this.renderTo = Ext.getBody();
        //     this.callParent(arguments);
            
        //     this.keyMap = new Ext.util.KeyMap({
        //         target:this.renderTo,
        //         key: Ext.EventObject.ESC,
        //         handler: function (key, event) {
        //             this.close();
        //         },
        //         stopEvent: true,
        //         scope:this
        //     });


        //     this.mon(this, {
        //         click: {
        //             element: 'el',
        //             fn: function (e) {
        //                 if (e.target.tagName.toLowerCase() == 'a') {
        //                     e.preventDefault();
        //                     //this.slideUp();
        //                     this.close();
        //                 }
        //             },
        //             scope: this
        //         }
        //     });

        // },
        
        // close : function() {
        //     this.slideUp();
        // },

        // afterRender: function () {
        //     this.el.setTop(-(this.el.getHeight() + 25));
        // }
    });

