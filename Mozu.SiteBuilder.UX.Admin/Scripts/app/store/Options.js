/**
* @class Taco.store.Options
* @author Thomas Phipps
* The Options store
*/

    Ext.define('Taco.store.Options', {
        extend: 'Taco.store.shared.BaseStore',
        model: 'Taco.model.Option',
        pageSize:500,
        //pageSize: 15,
        //buffered: true,
        //leadingBufferZone: 200,
        //trailingBufferZone:200,
        //clearOnPageLoad:false,
        storeId: 'optionsStore',
       // buffered: false,
        remoteFilter:false,
        remoteSort: false
    
    });
