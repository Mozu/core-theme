Ext.define('Taco.model.Resource', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "type",
            'type': 'string',
            "useNull": true
        }
    ]
});
