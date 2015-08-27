/**
 * @class Taco.core.ux.CustomerGroupComboBox
 */

Ext.define('Taco.core.ux.CustomerGroupComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.customergroupcombobox',
    requires: ['Taco.store.CustomerGroupComboBox'],
    displayField: 'display',
    valueField: 'value',
    minChars: 1,

    initStoreThing: false,
    initComponent: function () {
        var me = this;

        me.store = Ext.create('Taco.store.CustomerGroupComboBox');

        me.callParent(arguments);
    },
    setValue: function (value, doSelect) {
        var me = this;

        if (value && me.store.getCount()==0  && !me.initStoreThing) {
            me.initStoreThing = true;
            me.store.load({
                scope: this,
                filters: [
                    new Ext.util.Filter({
                        property: 'id',
                        value: value
                    })]
            });
        }
        me.callParent(arguments);
    }
});
