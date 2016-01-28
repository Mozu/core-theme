/**
 * @class Taco.model.WidgetDefinition
 * @author Ben 'Keeping the Pickles' Cripps 
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
         """""""""""""
 */

Ext.define('Taco.model.LayoutWidgetDefinition', {

    extend: 'Taco.core.data.Model',
    fields: [
        {
            name: 'id',
            type: 'string',
            useNull: true
        },
        {
            name: 'category',
            type: 'string'

        },
        {
            name: 'displayName',
            type: 'string',
            useNull: true
        },
        {
            name: 'icon',
            type: 'string',
            useNull: true
        },
        {
            name: 'maxWidth',
            type: 'int'
        },
        {
            name: 'maxHeight',
            type: 'int'
        },
        {
            name: 'minWidth',
            type: 'int'
        },
        {
            name: 'minHeight',
            type: 'int'
        },
        {
            name: 'previewHtml',
            type: 'string',
            useNull: true
        },
        {
            name: 'editView',
            type: 'string',
            useNull: true
        }, 
        {
            name: 'customEditor',
            type: 'string',
            useNull: true
        }, 
        {
            name:'editViewFields',
            type:'auto',
            defaultValue: []
        },
        {
            name: 'defaultConfig',
            type: 'auto',
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
        },
        {
            name: 'columns',
            type: 'auto',
            defaultValue: []
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/LayoutWidgetDefinition/read',
            //read: '/admin/Scripts/app/mocks/widgetdefinitions.json',
            create: '/admin/app/LayoutWidgetDefinition/create',
            update: '/admin/app/LayoutWidgetDefinition/edit',
            destroy: '/admin/app/LayoutWidgetDefinition/delete',
            duplicate: '/admin/app/LayoutWidgetDefinition/duplicate'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        }
    }

});

