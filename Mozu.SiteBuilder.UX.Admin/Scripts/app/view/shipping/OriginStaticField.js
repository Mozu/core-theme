///**
// * @class Taco.view.shipping.OriginStaticField
// */
//Ext.define('Taco.view.shipping.OriginStaticField', {
//    extend: 'Ext.Component',
//    alias: 'widget.originstaticfield',
//    mixins: {
//        field: 'Ext.form.field.Field'
//    },

//    tpl: '<div style = "padding: 10px 10px 10px 10px">{address1}<br/><tpl if="address2 !== \'\'">{address2}<br/></tpl><tpl if="address3 !== \'\'">{address3}<br/></tpl>{cityOrTown}, {stateOrProvince} {postalOrZipCode}</div>',

//    setValue: function (record) {
//        var me = this;
//        if (record.data) {
//            me.update(record.data);
//        }

//        return me.mixins.field.setValue.call(me, record);
//    },

//    isDirty: function () {
//        return false;
//    }
//});