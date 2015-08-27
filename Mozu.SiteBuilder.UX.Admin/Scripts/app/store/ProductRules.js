/**
 * @class Taco.store.Discounts
 */

    Ext.define('Taco.store.ProductRules', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.TargetRule',
        remoteFilter: false,
        remoteSort: false,
        pageSize: 50,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 'mc',
            clearSort: true,
            autoLoad: true
        },
        proxy: {
            type: 'ajax',
            extraParams: {
                domain: 'Product'
            },
            api: {
                read: '/admin/app/shipping/rules/read',
                create: '/admin/app/shipping/rules/create',
                update: '/admin/app/shipping/rules/edit',
                destroy: '/admin/app/shipping/rules/delete'
            },
            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: "message"
            },
            writer: {
                allowSingle: false,
                type: 'json'
            }
        }
       
       

        //proxy: {
        //    type: 'memory',
        //    data: [
        //    {
        //        'code':'lower 48',
        //        'description':'blablabla',
        //        'domain':'shippingZone',
        //        'expression':'a==b and c==d'
             
        //    },
        //    {
        //        'code': 'USA',
        //        'description': 'blablabla',
        //        'domain': 'shippingZone',
        //        'expression': 'a==b and c==d'

        //    },
        //    {
        //        'code': 'APAC',
        //        'description': 'apac bla bla bla ',
        //        'domain': 'shippingZone',
        //        'expression': 'a==b and c==d'

        //    },

        //    ]
        //}
    });
