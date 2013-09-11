/**
 * @class Taco.store.Discounts
 */

Ext.define('Taco.store.Locations', {
    extend: 'Ext.data.Store',
    fields: [
        { name: 'code', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'address', type: 'string' }
    ],
    "data": [
        {
            "code": "MTX1",
            "type": "Max Retail",
            "name": "Max",
            "address": "8743 Avenue B, Houston, Tx 75498"
        },
        {
            "code": "MTX2",
            "type": "Max Retail",
            "name": "Max",
            "address": "2004 Charleston, Suite 108, San Antonio, Tx 73412"
        },
        {
            "code": "MTX3",
            "type": "Max Retail",
            "name": "Max",
            "address": "435 Plaza Lane, Austin, Tx 78759"
        },
        
        {
            "code": "MTX4",
            "type": "Max Retail",
            "name": "Max",
            "address": "1245 Coit Rd, Dallas, Tx 78718"
        },
        {
            "code": "MNM5",
            "type": "Max Retail",
            "name": "Max",
            "address": "5542 Berry St, Dallas, Tx 76831"
        },
        {
            "code": "MNM1",
            "type": "Max Retail",
            "name": "Max",
            "address": "6800 Holly Ave Ne, Albuquerque, NM 87113"
        }
    ],
    remoteFilter: false,
    pageSize: 25,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});