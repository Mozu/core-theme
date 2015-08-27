/**
 * @class Taco.model.Address
 */
Ext.define('Taco.model.Address', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'firstName',             type: 'string' },
        { name: 'lastName',              type: 'string' },
        { name: 'middleNameOrInitial',   type: 'string' },
        { name: 'lastNameOrSurname',     type: 'string' },
        { name: 'companyOrOrganization', type: 'string' },
        { name: 'address1',              type: 'string' },
        { name: 'address2',              type: 'string' },
        { name: 'address3',              type: 'string' },
        { name: 'cityOrTown',            type: 'string' },
        { name: 'stateOrProvince',       type: 'string' },
        { name: 'countryCode',           type: 'string' },
        { name: 'postalOrZipCode',       type: 'string' },
        { name: 'addressIsValidated',    type: 'boolean' },
        { name: 'phoneNumber',           type: 'string' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            create: '/admin/app/address/create',
            read: '/admin/app/address/read',
            update: '/admin/app/address/update',
            destroy: '/admin/app/address/delete',
            duplicate: '/admin/app/address/duplicate'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json'
        }
    }
});
