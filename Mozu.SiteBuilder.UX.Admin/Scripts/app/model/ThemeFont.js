/**
 * @class Taco.model.ThemeFont
 */


    Ext.define('Taco.model.ThemeFont', {

        extend: 'Taco.core.data.Model',
        fields: ['id','name','cssString'],
        proxy: {
            type: 'ajaxproxy',
            api: {
                read: '/admin/Scripts/app/mocks/themefonts.json',
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

