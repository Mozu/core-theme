/**
 * @class  Taco.store.CustomerGroupComboBox
 */
Ext.define('Taco.store.CustomerGroupComboBox', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.CustomerGroupComboBox',
    storeId: 'CustomerGroupComboBox'
}, function () {
    new Taco.store.CustomerGroupComboBox;
});
