/**
 * @class Taco.model.Attribute
 */
Ext.define('Taco.model.ProductType', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.model.ProductTypeAttribute',
        'Taco.core.data.cache.ProxyCache'
    ],
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'isBase', type: 'boolean' },
        { name: 'goodsType', type: 'string', defaultValue: 'Physical'},
        { name: 'options', type: 'auto', defaultValue: [] },
        { name: 'numberOfProducts', type:'int'},
        { name: 'extras', type: 'auto', defaultValue: [] },
        { name: 'properties', type: 'auto', defaultValue: [] },
        { name: 'productUsages', type: 'array', defaultValue: ["Standard","Configurable", "Bundle", "Component"] },
        { name: 'modifiedDate', type: 'date', dateFormat: 'c' }
    /*    String Array Of one or many of the following string Values
            "Standard";
            "Configurable";
            "Bundle";
            "Component"; */
        
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
    // manipulate a record that is set to be duplicated prior to loading it in the view. Called by app\core\Controller.js
    beforeDuplicate: function () {
        this.raw = undefined;
        var suffix = " - Copy";
        this.data.name = this.data.name + suffix;
        this.commit();
        this.setDirty();
    },
    validations: [
     { type: 'length', name: 'name', min: 3, max: 100 },
     { type: 'presence', name: 'name' }
    ],
    proxy: {     
     //   type: 'taco-ajaxCacheProxy',
        type: 'ajaxproxy',
        contextLevel: 'm',
        deferCacheCallback:false,
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
