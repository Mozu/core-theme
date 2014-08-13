/**
 * @class Taco.model.Contact
 */
Ext.define('Taco.model.Contact', {
    extend: 'Taco.core.data.Model',

    /*
    address 3 and address 4 missing;



accountId: 1000
isBilling: true
isPrimaryBilling: true
isPrimaryShipping: false
isShipping: false


    address1: "2301 S 5TH ST APT 27"
    address2: ""
    addressIsValidated: true
    cityOrTown: "AUSTIN"
    countryCode: "US"
    email: "ojas_patel@volusion.com"
    firstName: "ojas"
    homePhone: "1231231231"
    id: 1000

    lastName: "patel"
    postalOrZipCode: "78704-5188"
    stateOrProvince: "TX"
    
    
    */

    fields: [

        {
            "name": "id",
            "type": "int",
            "useNull": true
        },
        {
            "name": "accountId",
            "type": "int",
            "useNull": true
        },
        {
            "name": "isBilling",
            "type": "boolean"
        },
        {
            "name": "isPrimaryBilling",
            "type": "boolean"
        },
        {
            "name": "isPrimaryShipping",
            "type": "boolean"
        },
        {
            "name": "isShipping",
            "type": "boolean"
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
            "name":"addressType",
            "type": "string",
            "defaultValue":"Residential"
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
            "name": "companyOrOrganization",
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
            convert: function (val, record) {                
                return Ext.util.Format.uppercase(val);
            },
            "useNull": true
        },
        {
            "name": "postalOrZipCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "stateOrProvince",
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
        },
        {
            "name": "addressIsValidated",
            "type": "boolean"
        }
    ]
});