/**
 * @class Taco.core.ux.modal.Confirmation
 */

Ext.define('Taco.core.ux.modal.Confirmation', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.core.ux.action.PrimaryButton', 'Taco.core.ux.action.SecondaryButton'],

    text: 'Are you sure you want to complete this action?',

    closeButton: false,

    initComponent: function () {
        this.content = {
            items: [{
                xtype: 'component',
                html: this.text
            }]
        };

        this.actions = {
            items: [{
                xtype: 'primarybutton',
                listeners: {
                    click: this.confirm,
                    scope: this
                }
            }, {
                xtype: 'secondaryaction',
                listeners: {
                    click: this.cancel,
                    scope: this
                }
            }]
        };

        this.callParent(arguments);
    },

    confirm: function () {
        if (this.fireEvent('beforeconfirm', this)) {
            this.hide();
            this.fireEvent('confirm', this);
        }
    },

    cancel: function () {
        if (this.fireEvent('beforecancel', this)) {
            this.hide();
            this.fireEvent('cancel', this);
        }
    }
});
