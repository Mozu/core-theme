Ext.define('Taco.model.LocalizedString', {
    extend: 'Taco.core.data.Model',
    idProperty: 'key',
    fields: [{
        name: 'key',
        type: 'string',
        mapping:'Key'
    }, {
        name: 'value',
        type: 'string',
        mapping: 'Value'
    }]
    //proxy: {
    //    type: 'ajaxproxy',
    //    api: {
    //        read: '/admin/app/localization/read'
    //    },
    //    reader: {
    //        type: 'json',
    //        root: 'items',
    //        successProperty: 'success',
    //        messageProperty: "message"
    //    }
    //}
});