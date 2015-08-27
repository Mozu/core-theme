/**
 * @class Taco.model.TimeZone
 */
Ext.define('Taco.model.TimeZone', {
    extend: 'Taco.core.data.Model',
    idProperty: 'name',
    fields: [{
        name: 'name',
        type: 'string'
    }, {
        name: 'offset',
        type: 'number'
    }, {
        name: 'isDaylightSavingsTime',
        type: 'bool'
    }, {
        name: 'selected',
        type: 'bool'
    }],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/generalsetting/timezones/read'
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
});