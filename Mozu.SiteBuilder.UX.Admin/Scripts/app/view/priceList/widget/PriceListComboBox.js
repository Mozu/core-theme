/**
 * @class  Taco.view.priceList.widget.PriceListComboBox
 */

Ext.define('Taco.view.priceList.widget.PriceListComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pricelistcombobox',
    requires: ['Taco.store.PriceLists'],
    displayField: 'name',
    valueField: 'id',
    minChars: 1,
    queryMode: 'local',
    lastQuery:"",
    excludedIds:[],
    initComponent: function () {
        var me = this;
        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.PriceLists',
            createOnly: true,
            autoLoad: false,
            filters: [
                function (record) {
                    //exclude any id's passed in via the excludedIds array;
                    if (me.excludedIds.length) {
                        var isExcluded = Ext.Array.findBy(me.excludedIds, function (id) {
                            return id === record.get("code");
                        });

                        if (isExcluded) {
                            return false;
                        }
                    }
                    return true;
                }
            ]
        });

        me.store.load();

        this.callParent(arguments);
    }
    
});
