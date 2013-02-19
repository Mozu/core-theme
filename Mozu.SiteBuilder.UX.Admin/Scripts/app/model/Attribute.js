/**
 * @class Taco.model.Attribute
 */
Ext.define('Taco.model.Attribute', {
    requires:['Taco.model.AttributeValue'],
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'inputType', type: 'string' },
        { name: 'dataType', type: 'string' },
        { name: 'valueType', type: 'string' },
        { name: 'isOption', type: 'boolean' },
        { name: 'isExtra', type: 'boolean' },
        { name: 'isProperty', type: 'boolean' },
        { name: 'min', type: 'auto' },
        { name: 'max', type: 'auto' },
        { name: 'regex', type: 'string' },
        {
            name: 'values',
            type: 'auto'
            //,
            //serialize: function (value, record) {
            //    return record.getAssociatedData()['getAttributeValues'];
           

            //}
        }
        
    ],
    getAttributeValues: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.AttributeValue',
            associationKey: 'values',
            foreignKey: 'attributeId',
            foreignProperty:'attribute'
        });
        
        
    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            create: '/admin/app/Test/testCreate',
            read: '/admin/Scripts/app/mocks/attributes.json',
            update: '/admin/app/Test/testUpdate',
            destroy: '/admin/app/Test/testDestroy'
        },
        //api: {
        //    create: '/admin/app/Attribute/create',
        //    read: '/admin/app/Attribute/read',
        //    update: '/admin/app/Attribute/update',
        //    destroy: '/admin/app/Attribute/destroy'
        //},
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json',
            allowSingle: false
        }
    }
});
