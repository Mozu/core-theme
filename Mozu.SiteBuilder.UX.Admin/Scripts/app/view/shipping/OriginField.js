///**
// * @class Taco.view.shipping.OriginField
// */
//Ext.define('Taco.view.shipping.OriginField', {
//    alias: 'widget.originfield',
//    extend: 'Ext.container.Container',
//    requires: ['Taco.view.shipping.OriginStaticField', 'Taco.view.shipping.OriginEditor'],
//    mixins: {
//        field: 'Ext.form.field.Field'
//    },

//    border: false,
//    layout: {
//        type: 'vbox'
//    },

//    initComponent: function () {
//        var me = this;

//        me.originStaticField = Ext.create('Taco.view.shipping.OriginStaticField');

//        me.editAction = Ext.create('Taco.core.ux.action.Action', {
//            text: 'Edit',
//            click: function () {
//                me.onEdit();
//            }
//        });

//        me.editContainer = Ext.create('Ext.container.Container');
//        me.originEditor = Ext.create('Taco.view.shipping.OriginEditor');

//        me.items = [{
//            xtype: 'container',
//            html: '<strong>Shipping origin</strong>',
//            cls: 'edittitle',
//            border: 0,
//            width: 100
//        },
//            me.editAction,
//            me.editContainer
//        ];

//        me.callParent(arguments);
//    },

//    onEdit: function () {
//        var me = this;
        
//        me.editAction.getEl().dom.style.display = 'none';
//        me.originStaticField.hide();
//        me.originEditor.loadRecord(this.data);
//        me.editContainer.add(me.originEditor);
//    },

//    setValue: function (record) {
//        var me = this;
//        me.data = record;

//        if (me.data) {
//            me.originStaticField.setValue(me.data);
//            me.editContainer.add(me.editAction);
//            me.editContainer.add(me.originStaticField);
//        } else {
//            me.data = Ext.create('Taco.model.SiteShippingOriginAddress');
//            me.originEditor.getForm().loadRecord(me.data);
//            me.editContainer.add(me.originEditor);
//        }

//        return me.mixins.field.setValue.call(me, me.data);
//    },

//    getValue: function () {
//        var me = this;

//        if (me.originEditor.getForm().getRecord()) {
//            me.originEditor.getForm().updateRecord(me.data);
//        }

//        return me.data;
//    },

//    isDirty: function () {
//        return false;
//    }
//});