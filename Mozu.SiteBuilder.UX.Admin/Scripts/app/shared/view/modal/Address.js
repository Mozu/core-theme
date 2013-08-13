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
    record: null,

    initComponent: function () {
        var formPanel,
            dirtyButton;

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'address-editor';

        if (!record.isModel) {
            record = Ext.create('Taco.model.Contact', record);
        }

        formPanel = Ext.widget({
            xtype: 'taco-addressform',
            record: record,
            manageHeight: false
        });

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'h2',
                    cls: 'order-modal-title',
                    html: 'Edit Address'
                }
            }, formPanel]
        };

        this.callParent(arguments);
    }
});