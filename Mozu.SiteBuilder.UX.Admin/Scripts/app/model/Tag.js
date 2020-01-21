Ext.define('Taco.model.Tag', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "type",
            type: 'auto',
            defaultValue: []
        }
    ]
});
