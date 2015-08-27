/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.entityManager.Lists', {
    extend: 'Ext.tree.Panel',
    
    requires: [
        'Taco.store.EntitiesListsTree'
    ],
   // title: 'Simple Tree',
    width: 250,
    height: '100%',

    rootVisible: false,
   // componentCls: 'taco-website-tree',
    store: { type: 'Taco.store.EntitiesListsTree' }
    //initComponent: function () {
    //}


});
