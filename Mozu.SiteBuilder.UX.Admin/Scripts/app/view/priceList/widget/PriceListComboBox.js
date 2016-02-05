/**
 * @class  Taco.view.priceList.widget.PriceListComboBox
 */

Ext.define('Taco.view.priceList.widget.PriceListComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pricelistcombobox',
    requires: ['Taco.store.PriceLists'],
    displayField: 'name',
    valueField: 'code',
    minChars: 1,
    queryMode: 'local',
    lastQuery:"",
    excludedIds:[],
    excludedCode: null,
    initComponent: function () {
        var me = this;
        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.PriceLists',
            createOnly: true,
            autoLoad: false,
            filterOnLoad: true,
            remoteFilter: false,
            clearFilters: true
            
        });
        me.store.load(
            {
                params: {
                    isLookup: true,
                    excludedCode: me.excludedCode
                },
                callback: function(records, operation, success) {
                    //console.log('called back');
                },
                scope: this
            }
        );

        this.callParent(arguments);
    }
    
});
