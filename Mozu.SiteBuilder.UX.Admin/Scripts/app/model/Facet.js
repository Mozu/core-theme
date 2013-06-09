/**
 * @class Taco.model.File
 * The File model
 */
Ext.define('Taco.model.Facet', {
    extend: 'Taco.core.data.Model',
    requires: [],
    fields: [{
        name: 'id',
        type: 'int',
        useNull: true
    }, {
        name: 'sourceId',
        type: 'string',
        useNull: true
    }, {
        name: 'sourceName',
        type: 'string',
        useNull: true
    }, {
        name: 'sourceType',
        type: 'string',
        useNull: true
    }, {
        name: 'allowsRangeQuery',
        type: 'boolean'
    }, {
        name: 'facetType',
        type: 'string',
        useNull: true
    }, {
        name: 'order',
        type: 'int',
        useNull: true
    }, {
        name: 'categoryId',
        type: 'int',
        useNull: true
    }, {
        name: 'overrideFacetId',
        type: 'int',
        useNull: true
    }, {
        name: 'isHidden',
        type: 'int',
        useNull: true
    }, {
        name: 'isvalid',
        type: 'boolean',
        useNull: true
    }, {
        name: 'validityCode',
        type: 'string',
        useNull: true
    }, {
        name: 'ranges',
        type: 'auto',
        useNull: true,
        defaultValue:[]
    }
    ]

    
});