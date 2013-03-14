/** 
 * @class Taco.model.PageTypeDefinition
 * @author Thom "wurds" Phipps
 */

    Ext.define('Taco.model.PageTypeDefinition', {

        extend: 'Taco.core.data.Model',
        fields: ['id', 'displayName', 'renderTemplate', 'entityType', 'pageType', 'documentType', 'userCreatable', 'properties', 'widgets',
            {
                name: 'isDefault',
                convert: function fullName(v, record) {
                    return record.data.entityType == record.data.renderTemplate;
                }
            }],
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
