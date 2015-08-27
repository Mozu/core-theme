/**
* @class Taco.model.OptionComboBox
* @author Jason Cochran
* The OptionComboBox model
*/

Ext.define('Taco.model.OptionComboBox', {
    extend: 'Taco.core.data.Model',
    fields: ['display', 'value', 'isConfigurable'],
    idProperty: 'value',

    proxy: {
        type: 'ajax',
        api: {
            //read: '/scripts/taco/mocks/categories.json',
            read: '/admin/app/options/autocomplete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json'
        }
    }
});