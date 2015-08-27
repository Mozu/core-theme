/**
 * @class Taco.store.NavigationTreeNodes 
 * @author Thomas Phipps
 */
Ext.define('Taco.store.NavigationTreeNodes', {
        extend: 'Taco.store.shared.TreeStore',
        model: 'Taco.model.NavigationTreeNode',
        requires:['Taco.model.NavigationTreeNode'],
       // pageSize: 20,
        //  numFromEdge: 10,
        // leadingBufferZone:40,
        // trailingBufferZone:10,
        autoSync:false,
       // buffered: false,
        //remoteFilter: true
    // remoteSort: true
        storeManagerConfig: {
            createOnly: true,
            autoLoad: false
        }
    });

