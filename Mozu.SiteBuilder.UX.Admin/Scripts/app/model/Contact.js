/**
 * @class Taco.model.Contact
 */
Ext.define('Taco.model.Contact', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "email",
            "type": "string",
            "useNull": true
        },
        {
            "name": "firstName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "middleName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "lastName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "address1",
            "type": "string",
            "useNull": true
        },
        {
            "name": "address2",
            "type": "string",
            "useNull": true
        },
        {
            "name": "address3",
            "type": "string",
            "useNull": true
        },
        {
            "name": "address4",
            "type": "string",
            "useNull": true
        },
        {
            "name": "companyName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "cityOrTown",
            "type": "string",
            "useNull": true
        },
        {
            "name": "countryCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "zipCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "state",
            "type": "string",
            "useNull": true
        },
        {
            "name": "homePhone",
            "type": "string",
            "useNull": true
        },
        {
            "name": "workPhone",
            "type": "string",
            "useNull": true
        },
        {
            "name": "mobilePhone",
            "type": "string",
            "useNull": true
        }
    ]
});