/**
 * @class Taco.core.ux.modal.Helper
 */
Ext.define('Taco.core.ux.modal.Helper', {
    extend: 'Taco.core.ux.modal.Modal', 
    alias: 'widget.helpermodal',
    autoShow: true,
    width: 600,

    initComponent: function () {

        this.form = Ext.create('Taco.core.ux.form.Form', this.form);

        Ext.apply(this, {
            content: {
                items: [this.form]
            },
            actions: {
                items: [{
                    xtype: 'dirtybutton',
                    dirtyState: true,
                    text: 'OK',
                    click: function () {
                        this.form.update();
                        this.hide();
                    },
                    scope: this
                }, {
                    xtype: 'secondaryaction',
                    text: 'Cancel',
                    click: function () {
                        this.hide();
                    },
                    scope: this
                }]
            }
        });

        this.items = [this.form];

        this.callParent(arguments);
    }
})