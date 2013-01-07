/** 
 * @class Taco.model.PageTypeDefinition
 * @author Thom "wurds" Phipps
 */

    Ext.define('Taco.model.PageTypeDefinition', {

        extend: 'Taco.core.data.Model',
        fields: [
             {
                 name: "Id",
                 type: "string",
                 useNull: true
             },
             {
                 name: "DisplayName",
                 type: "string",
                 useNull: true
             },
             {
                 name: "Icon",
                 type: "string",
                 useNull: true
             }
        ],

        proxy: {
            type: 'ajaxproxy',
            api: {
                read: '/admin/app/PageTypeDefinition/list'
            },
            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: "message"
            }
        }

    });
