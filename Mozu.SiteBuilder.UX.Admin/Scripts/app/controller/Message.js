/**
 * @class Taco.controller.Message
 * The Messages controller. Unlike other controllers, has no index method. Instead this controller runs the global message bar.
 */
Ext.define('Taco.controller.Message', {
    extend: 'Taco.core.Controller',
    views: [
        'Taco.view.NotifierBar',
        'Taco.view.Growl'
    ],

    messages: new Ext.util.MixedCollection(),

    refs: [{
        ref: 'header',
        selector: 'contentheader'
    }],

    init: function () {
        var me = this;

        me.application.on({
            setmessage: me.setMessage,
            setgrowl: me.setGrowl,
            scope: me
        });

        me.displayMessages = Ext.Function.createBuffered(function() {
            var header = me.getHeader();

            if (header && header.isComponent) {
                header.addCls('taco-has-message');
                header.updateLayout();
            }

            me.messages.each(function (item, index) {
                var prevMessage;

                if (index === 0) {
                    item.show();
                } else {
                    prevMessage = me.messages.getAt(index - 1);

                    if (prevMessage && prevMessage.rendered && !prevMessage.isHidden()) {
                        item.y = prevMessage.getRegion().bottom + 25;
                        item.show();
                    }
                }
            }, me);
        }, 300, me);

        me.callParent(arguments);

        me.messages.on({
            remove: {
                scope: me,
                fn: function () {
                    if (me.messages.getCount() < 1) {
                        var header = me.getHeader();

                        if (header && header.isComponent) {
                            header.removeCls('taco-has-message');
                            header.updateLayout();
                        }
                    }
                }
            }
        });

        Taco.core.StateManager.on({
            navigate: {
                scope: this,
                fn: 'destroyMessages'
            }
        });
    },

    /**
     * @private
     *
     * Close and destroy all message dialogs. This is used internally when a navigate
     * event has been fired.
     */
    destroyMessages: function () {
        this.messages.each(function (item) {
            item.close();
            this.messages.remove(item);
        }, this);
    },

    /**
     * Create a message dialog.
     *
     * @param {String} message The message text.
     * @param {"success"/"info"/"warning"/"error"} type The message status type.
     * @return {Taco.view.NotifierBar} The instantiated message dialog.
     */
    setMessage: function (message, type) {
        var dialog;

        dialog = Ext.create(this.getTacoViewNotifierBarView(), {
            message: message,
            messageType: type,
            listeners: {
                beforehide: {
                    scope: this,
                    fn: function (cmp) {
                        this.messages.remove(cmp);
                    }
                }
            }
        });

        this.messages.add(dialog);

        this.displayMessages();

        return dialog;
    },

    setGrowl: function(message, type, duration) {
        var growl;
        
        growl = Ext.create('Taco.view.Growl', {
            message: message,
            messageType: type,
            duration: duration,
            listeners: {
                beforehide: {
                    scope: this,
                    fn: function (cmp) {
                        this.messages.remove(cmp);
                    }
                }
            }
        });

        this.messages.add(growl);

        this.displayMessages();

        return growl;
    }
});
