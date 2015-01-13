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
        name: 'sourceDataType',
        type: 'string',
        useNull: true
    }, {
        name: 'allowsRangeQuery',
        type: 'boolean'
    }, {
        name: 'facetType',
        type: 'string',
        useNull: true,
        defaultValue: 'Value'
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
        useNull: true,
        persist:false

    }, {
        name: 'ranges',
        type: 'auto',
        useNull: true,
        defaultValue:[]
    }, {
        name: 'valueSortType',
        type: 'string',
        useNull: true,
        defaultValue: 'CountDescending'
    }],

    getFacetSortingStore: function () {
        var valAscDisplay,
            valDescDisplay,
            dataTypeLower = this.get('sourceDataType') ? this.get('sourceDataType').toLowerCase() : 'string';

        switch (dataTypeLower) {
            case 'number':
                valAscDisplay = 'Numerical: Low to High';
                valDescDisplay = 'Numerical: High to Low';
                break;
            case 'date':
                valAscDisplay = 'Date: Recent to Old';
                valDescDisplay = 'Date: Old to Recent';
                break;
            default:
                valAscDisplay = 'Alphabetical: A to Z';
                valDescDisplay = 'Alphabetical: Z to A';
        }

        return Ext.create('Ext.data.Store', {
            fields: ['id', "name"],
            data: [
                {
                    id: "CountAscending",
                    name: "Facet Count: Low to High"
                }, {
                    id: "CountDescending",
                    name: "Facet Count: High to Low"
                }, {
                    id: "ValuesAscending",
                    name: valAscDisplay
                }, {
                    id: "ValuesDescending",
                    name: valDescDisplay
                }
            ]
        });
    }

    
});