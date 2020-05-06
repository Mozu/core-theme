Ext.define('Taco.model.Base', {
    extend: 'Ext.data.Model'
});
Ext.define('Taco.model.tree.Base', {
    extend: 'Ext.data.TreeModel',
    requires: [
        'Taco.model.Base'
    ]
});
Ext.define('Taco.model.TransferShipmentTree', {
    extend: 'Taco.model.Base',
    fields: [{
        name: 'no',
        type: 'string'
    }, {
        name: 'shipmentNumber',
        type: 'string'
    }, {
        name: 'image',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    },
    {
        name: 'quantity',
        type: 'string'
    },
    {
        name: 'rowIcon',
        type: 'string'
    },
    {
        name: 'childrenIcon',
        type: 'string'
    },
    {
        name: 'shipmentCardId',
        type: 'string'
    }
    ]
});

