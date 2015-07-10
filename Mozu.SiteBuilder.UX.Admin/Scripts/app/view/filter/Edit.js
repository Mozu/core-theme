/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.filter.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.filter.Form'
    ],
    formCls: 'Taco.view.filter.Form',

    enableNextPrevious: false,

    rejectRecordOnCancel: false,

    title: 'Edit Filter',

    initComponent: function () {
        var me = this;
        this.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});