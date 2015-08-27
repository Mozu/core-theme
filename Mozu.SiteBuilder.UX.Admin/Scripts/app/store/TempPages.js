/**
 * @class Taco.store.TempPages
 */

    Ext.define('Taco.store.TempPages', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CmsDocument',
        pageSize: 100,
        remoteSort: true,
        remoteFilter: true,
        fields: ['id', 'name']
    });
