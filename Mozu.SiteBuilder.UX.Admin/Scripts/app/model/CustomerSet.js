/**
 * @class Taco.model.CustomerAccount
 */
Ext.define('Taco.model.CustomerSet', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 41,
        create: 44,
        update: 42,
        destroy: 43
    },
    idProperty:'code',
    fields: [
         {
            name: 'code',
            type: 'string'
        },        
        {
            name: 'name',
            type: 'string'        
        },
        {
            name: 'description',
            type: 'string'
        },
        {
          name:'isDefault',
          type:'boolean'
        },
        {
          name:'customerCount',
          convert: function (v,record) {
            if (record && record.raw && record.raw.aggregateInfo) {
              return record.raw.aggregateInfo.customerCount;
            }
            return v;
          }
        },
        {
          name: 'replacementCode',
          type: 'string'
        },
        {
          name: 'sites',
          type: 'auto',
           convert: function (v,record) {
             
             if (v && v.length && v[0].siteId) {
               return v.map(function (x) { return x.siteId });
             }
             return v;
           },
           serialize: function (v, record) {
             if (v && v.length && !v[0].siteId)
             {
               return v.map(function (x) {
                 return {
                   siteId: x,
                   customerSetCode: record.get('code')
                 };
               });
             }
             return v;
           }
        }
    ],    
   
   
    proxy: {
        type: 'ajaxproxy',
        api: {
            read:   '/admin/app/customer/customersets/list',
            create: '/admin/app/customer/customersets/create',
            update: '/admin/app/customer/customersets/edit',
            destroy: '/admin/app/customer/customersets/delete'
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