/**
 * @class Taco.model.WidgetDefinition
 * @author Thom "Bombadil" Phipps
          ___________
         [___________]
         /           \
        /~~^~^~^~^~^~^\
       |===============|
       | P I C K L E S |
       | ,-.   __      |
       | \ ,'-'. )     |
       |  '._'_;'      |
       ;===============;
    jgs \             /
         `"""""``""""`
 */

Ext.define('Taco.model.WidgetDefinition', {

    extend: 'Taco.core.data.Model',
    fields: [
         {
             name: "id",
             type: "string",
             useNull: true
         },
    {
        name: 'category',
        type: 'string'

    },
         {
             name: "displayName",
             type: "string",
             useNull: true
         },
         {
             name: "icon",
             type: "string",
             useNull: true
         },
         {
             name: "maxWidth",
             type: "int"
         },
         {
             name: "maxHeight",
             type: "int"
         },
         {
             name: "minWidth",
             type: "int"
         },
         {
             name: "minHeight",
             type: "int"
         },
         {
             name: "previewHtml",
             type: "string",
             useNull: true
         },
         {
             name: "editView",
             type: "string",
             useNull: true
         }, {
             name: "customEditor",
             type: "string",
             useNull: true
         }, {
             name:"editViewFields",
             type:'auto',
             defaultValue: []
         },
        {
            name: "editViewConfig",
            type: "auto",
            convert: function (v, record) {
                if (v) {
                    return eval("(" + v + ')');
                }
                return null;

            },
            useNull: true
        },
        
         {
             name: "defaultConfig",
             type: "auto",
             defaultValue: {}
         },
         {
             name: 'createView',
             type: 'string'
         },
        {
            name: 'validPageTypes',
            type: 'auto',
            defaultValue:['*']
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/WidgetDefinition/read',
            //read: '/admin/Scripts/app/mocks/widgetdefinitions.json',
            create: '/admin/app/WidgetDefinition/create',
            update: '/admin/app/WidgetDefinition/edit',
            destroy: '/admin/app/WidgetDefinition/delete',
            duplicate: '/admin/app/WidgetDefinition/duplicate'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }

});

