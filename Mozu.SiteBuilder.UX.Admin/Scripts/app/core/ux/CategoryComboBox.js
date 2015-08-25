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
    lastQuery:"",
    showDynamicRealTime: true,
    showDynamicPreComputed: true,
    excludedIds:[],
    initComponent: function () {
        var me = this;
        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Categories',
            createOnly: true,
            autoLoad: false,
            filters: [
                function (record) {
                    //exclude any id's past in via the excludedIds array;
                    if (me.excludedIds.length) {
                        var isExcluded = Ext.Array.findBy(me.excludedIds, function (id) {
                            return id == record.get("categoryCode");
                        });

                        if (isExcluded) {
                            return false;
                        }
                    }

                    var categoryType = record.get("categoryType");
                    if (categoryType == "Static") {
                        return true;
                    } else if (categoryType == "DynamicPreComputed") {
                        return (me.showDynamicPreComputed);
                    } else if (categoryType == "DynamicRealTime") {
                        return (me.showDynamicRealTime);
                    }
                    return true;
                }
            ]
        });
    
        me.store.load();

        this.callParent(arguments);
    },
    doQuery : function() {
        debugger;
        this.callParent(arguments)
    },
    setValue: function (value) {
        if (value === -1) {
            value = null;
        }
        this.callParent(arguments);
    }
});
