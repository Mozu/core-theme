/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.filter.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.filter.Form'
    ],
    formCls: 'Taco.view.filter.Form',

    style:"background-color:#fff",

    enableNextPrevious: false,

    rejectRecordOnCancel: false,

    title: 'Edit Filter',

    extraNavHeaderCls : "taco-navheader-white",

    useWhiteContainer: true,

    initComponent: function () {
        var me = this;

        //this.cls += " taco-navheader-white ";

        //this.bodyCls += " taco-navheader-white ";
        //this.bodyStyle = "background-color:#fff";

        this.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});