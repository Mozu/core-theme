/** 
 * @class Taco.model.PageTypeDefinition
 * @author Thom "wurds" Phipps
 */

    Ext.define('Taco.model.PageTypeDefinition', {

        extend: 'Taco.core.data.Model',
        fields: ['id','displayName','renderTemplate','entityType','pageType','documentType','userCreatable','properties','widgets'],
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
