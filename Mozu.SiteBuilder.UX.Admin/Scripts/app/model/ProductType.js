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
        {name:'numberOfProducts', type:'int'},
        { name: 'extras', type: 'auto' },
        { name: 'properties', type: 'auto' },
    { name: 'modifiedDate', type: 'date' }
    
        
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
        // api: {
        //     create: '/admin/app/Testing/testCreate',
        //     read: '/admin/Scripts/app/mocks/producttypes.json',
        //     update: '/admin/app/Testing/testUpdate',
        //     destroy: '/admin/app/Testing/testDestroy'
        // },
        api: {
            create: '/admin/app/ProductType/create',
            read: '/admin/app/ProductType/list',
            update: '/admin/app/ProductType/edit',
            destroy: '/admin/app/ProductType/delete'
        },
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
