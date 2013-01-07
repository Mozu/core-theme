/**
* @class Taco.model.User
* @author jons mom!
*/

Ext.define('Taco.model.User', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'string', isHidden: true },
        { name: 'email', type: 'string' },
        { name: 'expiration', type: 'date' },
        { name: 'isAuthenticated', type: 'boolean' },
        { name: 'accessLevel', type: 'string' },
        { name: 'activity', type: 'string' },
         { name: 'name', type: 'string' },
         { name: 'firstName', type: 'string' },
         { name: 'lastName', type: 'string' },
         { name: 'siteName', type: 'string' }
         
    ],



    // Event name overrides
    saveSuccess: "usersaved",
    saveFailure: "usersavefailure",
    destroyFailure: "userdestroyfailure",
    destroySuccess: "userdestroysuccess",

    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/scripts/taco/mocks/categories.json',
            read: '/admin/app/account/list',
            destroy:'/admin/app/account/logoff'

        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
        //,
       // actionMethods: { read: "POST" }
    }
});