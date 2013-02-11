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
        name: "configuration",
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
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/WidgetInsance/read',
            //read: '/admin/Scripts/app/mocks/widgetdefinitions.json',
            create: '/admin/app/WidgetInsance/create',
            update: '/admin/app/WidgetInsance/update',
            destroy: '/admin/app/WidgetInsance/destroy'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
});