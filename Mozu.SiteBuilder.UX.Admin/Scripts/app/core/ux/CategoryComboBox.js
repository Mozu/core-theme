/**
 * @class  Taco.core.ux.CategoryComboBox
 */

Ext.define('Taco.core.ux.CategoryComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.categorycombobox',
    requires: ['Taco.store.Categories'],
    displayField: 'nameAndCode',
    valueField: 'id',
    minChars: 1,
    queryMode: 'local',
    showDynamicRealTime: true,
    showDynamicPreComputed: true,
    initComponent: function () {
        var me = this;
        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Categories',
            createOnly: true,
            autoLoad: false
        });

        me.store.on({
            load: function (store) {
                store.filterBy(function(record) {
                    var categoryType = record.get("categoryType");
                    if (categoryType == "Static") {
                        return true;
                    } else if (categoryType == "DynamicPreComputed") {
                        return (me.showDynamicPreComputed);
                    } else if (categoryType == "DynamicRealTime") {
                        return (me.showDynamicRealTime);
                    }
                    return true;
                });
            },
            single: true,
            scope: this
        });
    
        me.store.load();

        this.callParent(arguments);
    },
    setValue: function (value) {
        if (value === -1) {
            value = null;
        }
        this.callParent(arguments);
    }
});
