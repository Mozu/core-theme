/*
Store that loads up all behavior categories 
Bradley Friemel
*/
Ext.define('Taco.store.BehaviorCategories', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.BehaviorCategory',
    requires: ['Taco.model.BehaviorCategory'],
    autoload: true
});