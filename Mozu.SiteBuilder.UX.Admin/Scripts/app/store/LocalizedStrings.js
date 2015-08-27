Ext.define('Taco.store.LocalizedStrings', {
    extend: 'Ext.data.Store',
    storeId: "localizationStore",
    model: 'Taco.model.LocalizedString',
    pageSize: 10000 // Ugh what do we need to do here?
});