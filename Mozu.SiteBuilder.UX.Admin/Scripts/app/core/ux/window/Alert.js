/**
 * @class Taco.core.ux.window.Alert
 * @author Jimmy Sanford
 *
 * The base class for an alert dialog window.
 */

Ext.define('Taco.core.ux.window.Alert', {
    extend: 'Taco.core.ux.window.Modal',

    primaryText: 'OK',
    scale: 'small',
    title: 'Alert',

    actionBar: {
        layout: {
            type: 'hbox',
            pack: 'center',
            defaultMargins: '0 10 0 0',
        }
    },
    actions: [{
        xtype: 'button',
        itemId: 'primaryAction',
        formBind: true
    }],

    initComponent: function () {
        this.callParent(arguments);
    },

    onShowComplete: function () {
        var action = this.down('#primaryAction');

        this.callParent(arguments);

        action.focus();
    },

    primaryHandler: function () {
        if (this.fireEvent('beforeconfirm', this) !== false) {
            this.close();
            this.fireEvent('confirm', this);
        }
    }
});
