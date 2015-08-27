/**
* @class Taco.model.StateComboBox
* @author Jason Cochran
* The State combo box model
*/

Ext.define('Taco.model.StateComboBox', {
    extend: 'Taco.core.data.Model',
    fields: ['stateCode', 'name'],
    idProperty: 'stateCode',

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    }
});