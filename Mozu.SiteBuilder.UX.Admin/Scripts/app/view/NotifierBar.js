/**
 * @class Taco.view.NotifierBar
 */
Ext.define('Taco.view.NotifierBar', {
    extend: 'Taco.core.ux.window.Modal',
    alias: 'widget.notifierbar',

    scale: 'small',

    closable: false,

    actions: [{
        xtype: 'button',
        ui: 'action',
        itemId: 'primaryAction',
        text: 'OK'
    }],

    layout: {
        type: 'fit'
    },

    config: {
        autoClose: false,
        message: '',
        messageType: 'info'
    },

    initComponent: function () {
        var type = this.getMessageType();
        var autoClose = this.getAutoClose();

        // this.cls = 'taco-notifierbar taco-notifierbar-' + type;
        this.setTitle(Ext.String.capitalize(type));

        this.items = [{
            xtype: 'component',
            html: this.getMessage()
        }];

        this.callParent(arguments);

        if (autoClose !== false) {
            this.on({
                show: {
                    delay: Ext.isNumber(autoClose) ? autoClose : 3000,
                    fn: function (dialog) { dialog.close(); }
                }
            });
        }
    },

    doSave: function () {
        this.saveSuccess(null);
    }
});
