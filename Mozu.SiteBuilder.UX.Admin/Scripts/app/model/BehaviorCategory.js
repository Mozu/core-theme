/**
 * @class Taco.model.AccountUser
 */
Ext.define('Taco.model.BehaviorCategory', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id',       type: 'string' },
        { name: 'name', type: 'string' }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/behaviorcategories'
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
