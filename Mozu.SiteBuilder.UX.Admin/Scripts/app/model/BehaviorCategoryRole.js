/**
 * @class Taco.model.AccountUser
 */
Ext.define('Taco.model.BehaviorCategoryRole', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/behaviorcategories/behaviors'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type:'json'
        }
    }
});
