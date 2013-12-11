/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.CustomerGroupNames', {
    requires: ['Taco.store.CustomerGroups'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.KeyValuePair',
    pageSize: 600,
    remoteSort: false,
    remoteFilter: false,
    constructor:function () {
        this.customerGroups = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerGroups');
        if (this.customerGroups.isLoading()) {
            this.mon(this.customerGroups, 'load', this.copyStoreData, this);
        } else {
            Ext.defer(this.copyStoreData, 100, this);
        }
        return this.callParent(arguments);
    },
    isLoading:function () {
        return this.customerGroups.isLoading();
    },
    copyStoreData:function () {
        var data = [];
        this.customerGroups.each(function (record) {
            data.push({                
                Key: record.data.Value,
                Value: record.data.Value
            });
        });
        if (data.length > 0) {
            this.loadData(data);
        }
    },
    storeManagerConfig: {
        createOnly: true
    }
});