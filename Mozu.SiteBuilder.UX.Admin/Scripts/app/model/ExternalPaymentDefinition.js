/**
 * @author Bradley Friemeel
 *
 * A model for the External Payment definitions used in Payment and Checkout.
 */

Ext.define('Taco.model.ExternalPaymentDefinition', {
    extend: 'Taco.core.data.Model',
    fields: [
        {
            name: 'name',
            type: 'string'
        }, {
            name: 'isEnabled',
            type: 'bool'
        }, {
            name: 'fullyQualifiedName',
            type: 'string'
        }, {
            name: 'credentials',
            type: 'auto'
        }
    ],

    proxy: {
        type: 'ajax',
        api: {
            //read: '/admin/Scripts/app/mocks/ExternalPaymentDefinitions.json'
            read: '/admin/app/checkoutsettings/externaldefinitions/read'
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
            read: '/admin/Scripts/app/mocks/ExternalPaymentDefinitions.json'
        }
    }
});