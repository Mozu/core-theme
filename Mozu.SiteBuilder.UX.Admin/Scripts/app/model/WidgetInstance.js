/**
 * @class Taco.model.WidgetInstance
 * @author Thom Furps
 */
Ext.define('Taco.model.WidgetInstance', {
    extend: 'Taco.core.data.Model',
    fields: [{
        name: "id",
        type: "string",
        useNull: true
    }, {
        name: "source",
        type: "any",
        useNull: true
    }, {
        name: "definitionId",
        type: "string",
        useNull: true
    }, {
        name: "zoneId",
        type: "string",
        useNull: true
    }, {
        name: "index",
        type: "int",
        useNull: true
    }, {
        name: "config",
        type: "any",
        useNull: true
    }, {
        name: "zoneScope",
        type: "string",
        useNull: true
    }, {
        name: 'content',
        type: 'string',
        persist: false
    }],
    get: function (field) {
        
        var value = this.callParent(arguments);
        if (value && field == 'config') {
            return Ext.apply({}, value);
        }
        return value;
    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/admin/app/WidgetInsance/read',
            //read: '/admin/Scripts/app/mocks/widgetdefinitions.json',
            create: '/admin/app/WidgetInstance/create',
            update: '/admin/app/WidgetInstance/update',
            destroy: '/admin/app/WidgetInstance/destroy'
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