/**
 * @class Taco.model.CustomerAccount
 */
Ext.define('Taco.model.CustomerSegment', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 41,
        create: 44,
        update: 42,
        destroy: 43
    },
    requires: [
   
    ],
    fields: [
        {
            name: 'id',            
            type: 'int'
        }, {
            name: 'code',
            type: 'string'
        },        
        {
            name: 'name',
            type: 'string'        
        },
        {
            name: 'nameCodeCombo',
            type: 'string',
            convert: function(value, record) {
                var name  = record.get('name'),
                    code = record.get('code');

                return code + ' - ' + name;
            }       
        },
        {
            name: 'description',
            type: 'string'
        }
    ],    
   
   
    proxy: {
        type: 'ajaxproxy',
        api: {
            read:   '/admin/app/customer/segments/list',
            create: '/admin/app/customer/segments/create',
            update: '/admin/app/customer/segments/edit',
            destroy:'/admin/app/customer/segments/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
           
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});