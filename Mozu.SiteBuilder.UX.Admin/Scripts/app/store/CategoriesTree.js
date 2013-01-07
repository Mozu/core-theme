/**
* @class Taco.store.CategoriesTree
* @author Jason Cochran
* The Categories store
*/





Ext.define('Taco.store.CategoriesTree', {
    extend: 'Taco.store.shared.TreeStore',
    model: 'Taco.model.Category',
    requires: ['Taco.model.Category'],
  //  modelPath: 'categories',
    batchUpdateMode: "operation",
    defaultRootId: 0,
    nodeParam: 'nodeQuery',
    root: {
        expanded: true
    }
});
