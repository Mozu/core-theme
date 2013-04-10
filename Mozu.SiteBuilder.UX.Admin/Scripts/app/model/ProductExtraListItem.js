Ext.define('Taco.model.ProductExtraListItem', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'value', type: 'string', defaultValue: '' },
        { name: 'delta', type: 'number', defaultValue: 0 }
    ]
});