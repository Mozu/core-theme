/**
 * @class Taco.store.Discounts
 */

    Ext.define('Taco.store.ShippingZones', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.TargetRule',
        remoteFilter: true,
        pageSize: 25,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        },
        remoteSort: true,
        sortInfo: {
            field: 'name',
            direction: 'asc' | 'desc'
        },
        proxy: {
            type: 'memory',
            data: [
            {
                'code':'lower 48',
                'description':'blablabla',
                'domain':'shippingZone',
                'expression':'a==b and c==d'
             
            },
            {
                'code': 'USA',
                'description': 'blablabla',
                'domain': 'shippingZone',
                'expression': 'a==b and c==d'

            },
            {
                'code': 'APAC',
                'description': 'apac bla bla bla ',
                'domain': 'shippingZone',
                'expression': 'a==b and c==d'

            },

            ]
        }
    });
