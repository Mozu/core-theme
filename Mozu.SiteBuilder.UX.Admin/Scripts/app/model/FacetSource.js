/**
 * @class Taco.model.File
 * The File model
 */
Ext.define('Taco.model.FacetSource', {
    extend: 'Taco.core.data.Model',
    requires: [],
    fields: [{
        name: 'sourceId',
        type: 'string',
        useNull: true
    }, {
        name: 'sourceType',
        type: 'string',
        useNull: true
    }, {
        name: 'sourceDataType',
        type: 'string',
        useNull: true
    }, {
        name: 'sourceName',
        type: 'string',
        useNull: true,
        defaultValue: []
    }, {
        name: 'allowsRangeQuery',
        type: 'boolean'
    }
    ],
    idProperty: 'sourceId'
    
});