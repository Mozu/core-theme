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
    width: '96%',
    y: 126,

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
});
