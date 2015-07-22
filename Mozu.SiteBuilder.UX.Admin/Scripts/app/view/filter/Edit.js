///**
// * @class  Taco.view.discount.Edit
// */

//Ext.define('Taco.view.filter.Edit', {
//    extend: 'Taco.core.ux.form.FullEditor',
//    requires: [
//        'Taco.view.filter.Form'
//    ],
//    formCls: 'Taco.view.filter.Form',

//    style:"background-color:#fff",

//    enableNextPrevious: false,

//    rejectRecordOnCancel: false,

//    title: 'Edit Filter',

//    extraNavHeaderCls : "taco-navheader-white",

//    useWhiteContainer: true,

//    initComponent: function () {
//        var me = this;

        

//        this.mon(me, "beforesave", function () {
//            debugger;
//            return true;
//        }, me);

//        this.callParent(arguments);
//    },

//    onDestroy: function () {
//        var me = this;

//        me.clearListeners();

//        this.callParent(arguments);
//    }
//});