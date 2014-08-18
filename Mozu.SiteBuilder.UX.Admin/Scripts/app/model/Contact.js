/**
 * @class Taco.model.Contact
 */
Ext.define('Taco.model.Contact', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            name: 'id',
            type: 'string',
            useNull: true
        },
        {
            name: 'accountId',
            type: 'int',
            useNull: true
        },
        {
            name: 'isBilling',
            type: 'boolean'
        },
        {
            name: 'isPrimaryBilling',
            type: 'boolean'
        },
        {
            name: 'isPrimaryShipping',
            type: 'boolean'
        },
        {
            name: 'isShipping',
            type: 'boolean'
        },
        {
            name: 'email',
            type: 'string',
            useNull: true
        },
        {
            name: 'firstName',
            type: 'string',
            useNull: true
        },
        {
            name: 'middleName',
            type: 'string',
            useNull: true
        },
        {
            name: 'addressType',
            type: 'string',
            defaultValue: 'Residential'
        },
        {
            name: 'lastName',
            type: 'string',
            useNull: true
        },
        {
            name: 'address1',
            type: 'string',
            useNull: true
        },
        {
            name: 'address2',
            type: 'string',
            useNull: true
        },
        {
            name: 'address3',
            type: 'string',
            useNull: true
        },
        {
            name: 'address4',
            type: 'string',
            useNull: true
        },
        {
            name: 'companyOrOrganization',
            type: 'string',
            useNull: true
        },
        {
            name: 'cityOrTown',
            type: 'string',
            useNull: true
        },
        {
            name: 'countryCode',
            type: 'string',
            convert: function (val) {
                return Ext.util.Format.uppercase(val);
            },
            useNull: true
        },
        {
            name: 'postalOrZipCode',
            type: 'string',
            useNull: true
        },
        {
            name: 'stateOrProvince',
            type: 'string',
            useNull: true
        },
        {
            name: 'homePhone',
            type: 'string',
            useNull: true
        },
        {
            name: 'workPhone',
            type: 'string',
            useNull: true
        },
        {
            name: 'mobilePhone',
            type: 'string',
            useNull: true
        },
        {
            name: 'addressIsValidated',
            type: 'boolean'
        }
    ]
});