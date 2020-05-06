Ext.define('Taco.model.Owner', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "id",
            "type": "int",
            "useNull": true
        },
        {
            "name": "type",
            'type': 'string',
            "useNull": true
        }
    ]
});
