Ext.define('Taco.model.LocalizedString', {
    extend: 'Taco.core.data.Model',
    idProperty: 'key',
    fields: [{
        name: 'key',
        type: 'string',
        mapping:'Key'
    }, {
        name: 'value',
        type: 'string',
        mapping: 'Value'
    }]
});