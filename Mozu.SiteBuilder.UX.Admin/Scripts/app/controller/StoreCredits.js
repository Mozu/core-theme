/**
 * @class  Taco.controller.StoreCredit
 */
Ext.define('Taco.controller.StoreCredits', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.StoreCredit'],
    stores: ['Taco.store.StoreCredits'],
    views: ['storeCredit.Index'],
    modelName: 'StoreCredit',
    editorView: 'Taco.view.storeCredit.Edit'
});