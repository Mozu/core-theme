/**
* @class Taco.store.SiteDirectoryNodes
* @author Jason Cochran
* The SiteDirectoryNodes store
*/


    Ext.define('Taco.store.SiteDirectoryNodes', {
        extend: 'Taco.store.shared.TreeStore',
        model: 'Taco.model.SiteDirectoryNode',
        requires:['Taco.model.SiteDirectoryNode'],
      //  batchUpdateMode: "operation",
      //  defaultRootId: 0,
        nodeParam: 'id',
        
        root: {
            expanded: true
        }
    });
