/**
 * @class Taco.store.Discounts
 */

Ext.define('Taco.store.ShippingInclusionRules', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.ShippingInclusionRule',
        remoteFilter: false,
        remoteSort: false,
        pageSize: 50,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true,
            createOnly:true,
        },
        proxy: {
            type: 'ajax',
           
            api: {
                read: '/admin/app/shipping/ShippingInclusionRules/read',
                create: '/admin/app/shipping/ShippingInclusionRules/create',
                update: '/admin/app/shipping/ShippingInclusionRules/edit',
                destroy: '/admin/app/shipping/ShippingInclusionRules/delete'
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
