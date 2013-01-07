
Ext.define('Taco.model.Behavior', {
    extend: 'Taco.core.data.Model',

    fields: [{
        name: 'id',
        type: 'int',
        useNull: true
    }, {
        name: 'name',
        type: 'string',
        useNull: true
    }],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/Scripts/app/mocks/behaviors.json'
        }
    }
})