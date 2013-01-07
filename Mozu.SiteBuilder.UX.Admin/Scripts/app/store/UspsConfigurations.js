/**
* @class Taco.store.UspsConfigurations
* @author Jason Cochran
* The UspsConfigurations Store
*/


    Ext.define('Taco.store.UspsConfigurations', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.UspsConfiguration',
        remoteFilter: true,
        pageSize: 1000
    });
