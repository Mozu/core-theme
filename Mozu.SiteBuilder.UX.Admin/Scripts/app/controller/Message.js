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
            dissmissmessages: me.destroyMessages,
            scope: me
        });

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
        if (this.successMessageHandler) {
            this.successMessageHandler.hideMessages();
        }
        if (this.errorMessageHandler) {
            this.errorMessageHandler.hideMessages();
        }
    },

    getMessageHandler: function(message, type) {
        return Ext.create(this.getTacoViewNotifierBarView(), {
            messages: [ { msg: message } ],
            messageType: type,
            autoShow: true,
            listeners: {
                beforehide: {
                    scope: this,
                    fn: function (cmp) {
                        this.messages.remove(cmp);
                    }
                }
            }
        });
    },
    /**
     * Create a message dialog.
     *
     * @param {String} message The message text.
     * @param {"success"/"info"/"warning"/"error"} type The message status type.
     * @return {Taco.view.NotifierBar} The instantiated message dialog.
     */
    setMessage: function (message, type) {

        switch (type) {

            case 'success': 

                if (!this.successMessageHandler) {
                    this.successMessageHandler = this.getMessageHandler(message, type);
                }

                else {
                    this.successMessageHandler.addMessage({ msg: message });
                }
                break;

            case 'error': 
                if (!this.errorMessageHandler) {
                    this.errorMessageHandler = this.getMessageHandler(message, type);
                }
                else {
                    this.errorMessageHandler.addMessage({ msg: message });
                }
                break;

            default: 
                console.warn('This event type hasnt been established!');

        }
    }
});
