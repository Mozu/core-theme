

Ext.define('Taco.store.Behaviors', {
    extend: 'Taco.store.shared.TreeStore',
    model: 'Taco.model.Behavior',
    requires: ['Taco.model.Behavior'],
    batchUpdateMode: "operation",
    defaultRootId: 0,
    nodeParam: 'nodeQuery',
    root: {
        expanded: true
    }
});