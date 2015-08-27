/**
 * @author Michael Speed Elder
 *
 * A model for the Gateway definitions used in Payment and Checkout.
 */

Ext.define('Taco.model.GatewayDefinitions', {
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
            name: 'prodServiceURL',
            type: 'string'
        }, {
            name: 'testServiceURL',
            type: 'string'
        }, {
            name: 'integrationImplTypeName',
            type: 'string'
        }, {
            name: 'supportedCards',
            type: 'auto' // *** String[]
        }, {
            name: 'credentialDefinitions',
            type: 'auto' // *** Object[]
        }
    ],

    proxy: {
        type: 'ajax',
        api: {
            //read: '/admin/Scripts/app/mocks/GatewayDefinitions.json'
            read: '/admin/app/checkoutsettings/gatewaydefinitions/read'
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
            read: '/admin/Scripts/app/mocks/GatewayDefinitions.json'
        }
    }
});