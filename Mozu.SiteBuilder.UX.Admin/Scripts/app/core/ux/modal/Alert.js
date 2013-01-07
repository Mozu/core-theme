/**
 * @class Taco.core.ux.modal.Alert
 */

Ext.define('Taco.core.ux.modal.Alert', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.action.PrimaryButton'],

    initComponent: function() {
        var me = this;

        if (me.text) {
            Ext.apply(me.content, {
                items: [{
                    xtype: 'component',
                    html: me.text
                }]
            });
        }

        Ext.apply(me.actions, {
            items: [{
                xtype: 'primarybutton',
                listeners: {
                    click: {
                        fn: me.confirm,
                        scope: me
                    }
                }
            }]
        });

        me.callParent(arguments);
    },

    show: function() {
        var me = this;

        me.callParent(arguments);

        me.down('primarybutton').el.focus();
    },

    confirm: function() {
        var me = this;

        if (me.fireEvent('beforeconfirm')) {
            me.hide();
            me.fireEvent('confirm');
        }
    }
});