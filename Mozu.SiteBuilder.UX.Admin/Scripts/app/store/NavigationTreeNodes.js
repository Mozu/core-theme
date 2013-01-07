/**
 * @class Taco.store.NavigationTreeNodes 
 * @author Thomas Phipps
 */
Ext.define('Taco.store.NavigationTreeNodes', {
        extend: 'Taco.store.shared.TreeStore',
        model: 'Taco.model.NavigationTreeNode',
       // pageSize: 20,
        //  numFromEdge: 10,
        // leadingBufferZone:40,
        // trailingBufferZone:10,
        autoSync:true,
        storeId: 'navigationTreeNodeStore'
       // buffered: false,
        //remoteFilter: true
        // remoteSort: true
    });

