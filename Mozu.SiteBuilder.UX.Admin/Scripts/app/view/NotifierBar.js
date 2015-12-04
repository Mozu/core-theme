/**
 * @class Taco.view.NotifierBar
 */
Ext.define('Taco.view.NotifierBar', {
    extend: 'Ext.container.Container',
    alias: 'widget.notifierbar',
    bodyPadding: '9 10 9 10',
    closeAction: 'destroy',
    header: false,
    height: false,
    manageHeight: false,
    minHeight: 40,
    overflowY: 'hidden',

    layout: {
        type: 'fit'
    },

    renderTo: document.body,

    showClass: 'taco-shown',

    initComponent: function () {
        var tpl;

        this.messageTimeout = null;

        this.cls = 'taco-notifierbar taco-notifierbar-' + this.messageType;

        tpl = new Ext.XTemplate(
            '<span class="message">',
                '<tpl for="messages">',    
                    '<div>',
                        '<span>{msg}</span>',
                    '</div>',
                '</tpl>',    
            '<span class="{iconCls}"></span>'
        );

        this.items = [{
            xtype: 'component',
            itemId: 'messageQueue',
            padding: '0 30 0 30',
            tpl: tpl,
            data: {
                messages: this.messages,
                iconCls: this.messageType !== 'success' ? 'close-icon' : ''
            },
            listeners: {
                click: {
                    scope: this,
                    element: 'el',
                    fn: function (e, t) {
                        if (e.getTarget('.close-icon', 10)) {
                            this.hideMessages();
                        }
                    }
                }
            }
        }];

        this.callParent(arguments);

        this.messageQueue = this.down('#messageQueue');

        this.showMessage();
    },

    resetMessages: function() {
        this.messages = [];
    },

    hideMessages: function() {
        var me = this;

        me.messages = [];
        me.removeCls(this.showClass);

        Ext.defer(function() {
            me.messageQueue.update({
                messages: []
            });
        }, 100);
    },

    showMessage: function(delay) {
        var me = this;

        Ext.defer(function() {
            this.addCls(this.showClass);
        }, delay, this);

        if (this.messageType !== 'success') return false;

        clearTimeout(this.messageTimeout);

        this.messageTimeout = setTimeout(this.hideMessages.bind(this), 2000);
    },

    addMessage: function(message) {

        this.messages.push(message);

        this.messageQueue.update({
            messages: this.messages,
            iconCls: this.messageType !== 'success' ? 'close-icon' : ''
        });

        this.showMessage();
    }
});
