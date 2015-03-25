/*
Store that loads up all behaviors for a categories 
Bradley Friemel
*/
Ext.define('Taco.store.BehaviorCategoryRoles', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.BehaviorCategoryRole',
    requires: ['Taco.model.BehaviorCategoryRole'],
    autoload: true,
    remoteFilter: true
});