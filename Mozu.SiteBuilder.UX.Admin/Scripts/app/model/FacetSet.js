/**
 * @class Taco.model.File
 * The File model
 */
Ext.define('Taco.model.FacetSet', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Facet', 'Taco.model.FacetSource'],
    fields: [{
        name: 'categoryId',
        type: 'auto',
        useNull: true
    }, {
        name: 'configured',
        type: 'auto',
        useNull: true,
        defaultValue:[]
    }, {
        name: 'available',
        type: 'auto',
        useNull: true,
        defaultValue: [],
        persist: false
    }
    ],

    getConfigured: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.Facet',
            associationKey: 'configured',
            foreignKey: 'categoryId2',
            foreignProperty: 'facetSet'
        });
    },
    getAvailable: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.FacetSource',
            associationKey: 'available',
            foreignKey: 'categoryId2',
            foreignProperty: 'facetSet'
        });
    },
    
    idProperty: 'categoryId',

    proxy: {
        type: 'ajax',

        api: {
            read: '/admin/app/facet/set/read',
            update: '/admin/app/facet/set/edit'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});