/*
Store that loads
Bradley Friemel
*/
Ext.define('Taco.store.BehaviorNodes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.BehaviorNode',
    requires: ['Taco.model.BehaviorNode'],
    autoload: true,
    remoteFilter: true
});