/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Address', {
    extend: 'Taco.core.ux.window.WindowWithActions',
    requires: [
        'Taco.model.Contact',
        'Taco.shared.view.form.Address'
    ],

    autoShow: true,

    width: 700,

    addressHasNames: true,

    formCfg: null,

    initComponent: function () {
        this.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';

        if (!this.record || !this.record.isModel) {
            this.record = Ext.create('Taco.model.Contact', this.record);
        }

        this.form = Ext.widget(Ext.apply({
            xtype: 'taco-addressform',
            record: this.record,
            manageHeight: false
        }, this.formCfg));

        this.items = [this.form];
        
        this.callParent(arguments);

        this.on({
            save: function () {
                this.form.save();
            },
            scope: this
        });
    }
});