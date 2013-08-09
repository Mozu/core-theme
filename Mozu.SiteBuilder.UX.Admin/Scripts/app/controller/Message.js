/**
 * @class Taco.controller.Message
 * The Messages controller. Unlike other controllers, has no index method. Instead this controller runs the global message bar.
 */
Ext.define('Taco.controller.Message', {
    extend: 'Taco.core.Controller',
    views: ['Taco.view.NotifierBar'],
    init: function () {
        var me = this;
        // last resort event
        me.application.on({
            setmessage: me.setMessage,
            scope: me
        });

        me.displayMessages = Ext.Function.createBuffered(function() {
            this.view.update(this.messages);
            this.view.isHidden()&&this.view.slideDown();
        },300,me);

        me.callParent(arguments);
    },

    messages: [],

    setMessage: function(message,type) {
        var me = this;
        this.messages.push({ message: message, type: type});

        if (!this.view) {
            this.view = Ext.create(this.getTacoViewNotifierBarView());
            
            //this.view = this.getView('Taco.view.NotifierBar').create();

            this.view.on('beforehide',function() {
                me.messages = [];
            });
        }
        this.displayMessages();
    }

});