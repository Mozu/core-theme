/**
 * @class Taco.view.NotifierBar
 */
    Ext.define('Taco.view.NotifierBar', {
        extend: 'Ext.Component',
        alias: 'widget.notifierbar',
       
        cls: Taco.baseCSSPrefix + 'notifierbar',

        hideMode: 'visibility',
        hidden: true,

        downCls: Taco.baseCSSPrefix + 'notifierbar-down',

        tpl: new Ext.XTemplate(
            '<ul>',
            '<tpl for=".">',
                '<li class="' + Taco.baseCSSPrefix + 'message-{type}"><span class="' + Taco.baseCSSPrefix + 'message-icon">&nbsp;</span>{message}</li>',
            '</tpl>',
            '</ul>',
            '<a class="' + Taco.baseCSSPrefix + 'notifierbar-dismiss" href="#">OK</a>'
        ),

        slideDown: function () {

            this.show();
            this.el.animate({
                duration: 250,
                easing: "easeOut",
                to: {
                    top: -40,
                    opacity: 1
                }
            });
        },

        slideUp: function () {
            this.el.animate({
                duration: 250,
                easing: "easeOut",
                to: {
                    top: -(this.el.getHeight() + 25),
                    opacity: 0
                },
                listeners: {
                    afteranimate: function() {
                        this.hide();
                    },
                    scope: this
                }
            });
        },

        initComponent: function () {
            this.renderTo = Ext.getBody();
            this.callParent(arguments);
            this.mon(this, {
                click: {
                    element: 'el',
                    fn: function (e) {
                        if (e.target.tagName.toLowerCase() == 'a') {
                            this.slideUp();
                            e.preventDefault();
                        }
                    },
                    scope: this
                }
            });

        },

        afterRender: function () {
            this.el.setTop(-(this.el.getHeight() + 25));
        }
    });

