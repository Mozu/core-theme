/**
 * Taco.model.SimplegridColumn
 */
Ext.define('Taco.model.SimplegridColumn', {
    extend: 'Taco.core.data.Model',

    idProperty: 'id',

    fields: [{
        name: 'id',
        type: 'string'
    }, {
        name: 'dataIndex',
        type: 'string'
    }, {
        name: 'text',
        type: 'string',
        defaultValue: ''
    }, {
        name: 'colIndex',
        type: 'int'
    }, {
        name: 'renderer',
        type: 'auto',
        defaultValue: function (value) { return value; }
    }, {
        name: 'align',
        type: 'string',
        defaultValue: 'left'
    }, {
        name: 'editable',
        type: 'boolean',
        defaultValue: false
    }, {
        name: 'editor',
        type: 'auto',
        defaultValue: { xtype: 'textfield' }
    }],

    validations: [{
        field: 'id',
        type: 'presence'
    }, {
        field: 'dataIndex',
        type: 'presence'
    }, {
        field: 'align',
        type: 'inclusion',
        list: ['left', 'center', 'right']
    }]
});