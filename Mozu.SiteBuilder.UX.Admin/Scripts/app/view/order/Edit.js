/**
 * @class Taco.view.order.Edit
 */


Ext.define('Taco.view.order.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.order.Form'
    ],
    formCls: 'Taco.view.order.Form',

    initComponent: function () {
        this.saveHidden
            = this.cancelHidden
            = this.record.get('orderStatus') !== 'Created';

        this.callParent(arguments);
    }
});