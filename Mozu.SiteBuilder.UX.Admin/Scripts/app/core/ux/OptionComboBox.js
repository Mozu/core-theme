/**
 * @class Taco.core.ux.OptionComboBox
 */

Ext.define('Taco.core.ux.OptionComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.optioncombobox',
    displayField: 'display',
    valueField: 'value',
    minChars: 1,
    isConfigurable:false,
    initStoreThing: false,
    valueField: 'id',
    displayField: 'internalName',
    queryMode:'local',
    initComponent: function () {
        var me = this;
        me.store = Taco.app.getStore('Taco.store.Options');
        if (!me.store.lastOptions) {
            me.store.load();
        }

        me.store.clearFilter(true);
        me.store.filter(
            {
                property: 'isConfigurable',
                value: this.isConfigurable});

            me.callParent(arguments);
    },

    setValue: function (value, doSelect) {
        var me = this;

        if (value && me.store.getCount() == 0 && !me.initStoreThing) {
            me.initStoreThing = true;
            me.store.clearFilter(true);
            
            me.store.filter({ property: 'id', value: value });
            
        }
        me.callParent(arguments);
    }
});
