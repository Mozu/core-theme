/**
* @class Taco.store.ProductComboBox
* @author Jason Cochran
* The Product combo box store
*/

    Ext.define('Taco.store.ProductComboBox', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.ProductComboBox',
        storeId: 'ProductComboBox'
    });