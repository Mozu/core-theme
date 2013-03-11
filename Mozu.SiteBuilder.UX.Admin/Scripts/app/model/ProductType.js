/**
 * @class Taco.model.Attribute
 */
Ext.define('Taco.model.ProductType', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.ProductTypeAttribute'],
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'isBase', type: 'boolean' },
        { name: 'options', type: 'auto', defaultValue: [] },
        {name:'numberOfProducts', type:'int'},
        { name: 'extras', type: 'auto', defaultValue: [] },
        { name: 'properties', type: 'auto', defaultValue: [] },
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
    getExtras: function () {
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
            read: '/admin/app/ProductType/read',
            update: '/admin/app/ProductType/update',
            destroy: '/admin/app/ProductType/destroy'
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
