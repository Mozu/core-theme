/**
 * @class Taco.model.Attribute
 */
Ext.define('Taco.model.ProductType', {
    requires: ['Taco.model.ProductTypeAttribute'],
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'isBase', type: 'boolean' },
        { name: 'options', type: 'auto' },
        { name: 'extras', type: 'auto' },
        { name: 'properties', type: 'auto' }
        
    ],
    getOptions: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductTypeAttribute',
            modelDefaults: { usageType: 'option' },
            associationKey: 'options',
            foreignKey: 'productTypeId',
            foreignProperty: 'productType'
        });

    },
    getExtas: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductTypeAttribute',
            modelDefaults: { usageType: 'extra' },
            associationKey: 'extras',
            foreignKey: 'productTypeId',
            foreignProperty: 'productType'
        });

    },
    getProperties: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductTypeAttribute',
            modelDefaults:{usageType:'property'},
            associationKey: 'properties',
            foreignKey: 'productTypeId',
            foreignProperty: 'productType'
        });

    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            create: '/admin/app/Testing/testCreate',
            read: '/admin/Scripts/app/mocks/producttypes.json',
            update: '/admin/app/Testing/testUpdate',
            destroy: '/admin/app/Testing/testDestroy'
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
