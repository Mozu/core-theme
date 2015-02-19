/**
* @class Taco.store.MediaAssociations
*/
//Ext.define('Taco.store.MediaAssociations', {
//    extend: 'Ext.data.Store',
//    model: 'Taco.model.MediaAssociation',
//    remoteSort: false,
//    remoteFilter: false,    
//    data: []
//});

Ext.define('Taco.store.MediaAssociations', {
    extend: 'Taco.store.shared.BaseStore',
    model: 'Taco.model.MediaAssociation',
    proxy: 'memory',
    pageSize: 20,

    buffered: false,
    remoteFilter: false,
    remoteSort: false,
    sorters: [{
        sorterFn: function (m1, m2) {
            var seq1 = m1.get('sequence'),
                seq2 = m2.get('sequence');
            if (seq1 === seq2) {
                return 0;
            }
            return seq1 < seq2 ? -1 : 1;
        }
    }]
    //storeManagerConfig: {
    //    clearFilters: true,
    //    contextLevel: 'c',
    //    clearSort: true,
    //    autoLoad: true
    //}
});