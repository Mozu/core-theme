/**
 * @class Taco.controller.Message
 * The Messages controller. Unlike other controllers, has no index method. Instead this controller runs the global message bar.
 */
Ext.define('Taco.controller.Message', {
    extend: 'Taco.core.Controller',
    views: ['Taco.view.NotifierBar'],

    messages: new Ext.util.MixedCollection(),

    refs: [{
        ref: 'header',
        selector: 'contentheader'
    }],

    init: function () {
        var me = this;

        me.application.on({
            setmessage: me.setMessage,
            scope: me
        });

        me.displayMessages = Ext.Function.createBuffered(function() {
            me.messages.each(function (item, index) {
                item.show();
            }, me);
        }, 300, me);

        me.callParent(arguments);

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
            autoClose: type === 'success',
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
    }
});
