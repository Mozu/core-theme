Ext.define('Taco.model.CarrierAccountDefinitions', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            name: 'id',
            type: 'string'
        }, {
            name: 'countryCode',
            type: 'string',
            defaultValue: 'US'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'credentialDefinitions',
            type: 'auto' // *** Object[]
        }
    ],

    proxy: {
        type: 'ajax',
        api: {
            
            read: '/admin/Scripts/app/mocks/CarrierAccountDefinitions.json'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        },
        mockApi: {
            read: '/admin/Scripts/app/mocks/CarrierAccountDefinitions.json'
        }
    }
});