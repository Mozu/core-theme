/**
 * @class  Taco.core.ux.CategoryComboBox
 */

Ext.define('Taco.core.ux.CategoryComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.categorycombobox',
    xtype: 'taco-categorycombobox',
    requires: ['Taco.store.Categories'],
    displayField: 'nameAndCodeAndStatus',
    valueField: 'id',
    minChars: 1,
    queryMode: 'local',
    lastQuery:"",
    showDynamicRealTime: true,
    showDynamicPreComputed: true,
    excludedIds:[],
    listeners: {
        beforequery: function(queryPlan) {
            var me = this;
            me.store.clearFilter(me.customFilter);
            me.store.filter(me.customFilter);
            return true;
        }
    },
    initComponent: function () {
        var me = this;

        me.customFilter = new Ext.util.Filter({
            filterFn: function(item) {
                var searchValue = me.getValue().toLowerCase();
                var name = item.get('name');
                var categoryCode = item.get('categoryCode');
                var id = item.get('id');

                return name.toLowerCase().indexOf(searchValue) == 0 || categoryCode.toLowerCase().indexOf(searchValue) == 0 || id.toString().indexOf(searchValue) == 0;
            }
        });
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
    setValue: function (value) {
        if (value === -1) {
            value = null;
        }
        this.callParent(arguments);
    }
});
