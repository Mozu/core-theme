/**
 * @class Taco.model.Attribute
 */
Ext.define('Taco.model.Attribute', {
    requires: ['Taco.model.AttributeValue'],
    extend: 'Taco.core.data.Model',
    fields: [{
            name: 'id',
            type: 'auto'
        }, {
            /* numeric id of this attribute used by the service */
            name: 'attributeId',
            type: 'int'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'code',
            type: 'string',
            useNull: true
        }, {
            name: 'inputType',
            type: 'string'
        }, {
            name: 'dataType',
            type: 'string'
        }, {
            name: 'valueType',
            type: 'string'
        }, {
            name: 'isOption',
            type: 'boolean'
        }, {
            name: 'isExtra',
            type: 'boolean'
        }, {
            name: 'adminName',
            type: 'string'
        }, {
            name: 'isActive',
            type: 'boolean'
        }, {
            name: 'isRequired',
            type: 'boolean'
        },
        {
            name:'isVisible',
            type:'boolean',
            defaultValue:false
        },
        {
            name: 'displayGroup',
            type: 'string',
            defaultValue: 'Admin'
        }, {
            name: 'isProperty',
            type: 'boolean'
        }, {
            name: 'min',
            type: 'auto',
            convert: function (v, r) {
                return r.convert(v, r);
            }
        }, {
            name: 'max',
            type: 'auto',
            convert: function (v, r) {
                return r.convert(v, r);
            }
        }, {
            name: 'minDate',
            type: 'auto',
            convert: function (v, r) {
                return r.convert(v, r);
            }
        }, {
            name: 'maxDate',
            type: 'auto',
            convert: function (v, r) {
                return r.convert(v, r);
            }
        }, {
            name: 'rows',
            type: 'auto'
        }, {
            name: 'attributeMetadata',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'regex',
            type: 'string'
        }, {
            name: 'values',
            type: 'auto',
            defaultValue: []
        }
    ],
    supportsAttributeType:function () {
        return true;
    },
    supportsDisplayGroup: function () {
        return false;
    },
    supportsValueType: function () {
        return false;
    },
    supportsIsRequired: function () {
        return false;
    },
    supportsIsVisible: function () {
        return false;
    },
    allowProductDataType: function () {
        return true;
    },

    convert: function (v, r) {
        if (r.data.dataType == 'DateTime') {
            return r.convertDate(v);
        }
        if (r.data.dataType == 'Bool') {
            return r.convertBool(v);
        }
        if (r.data.dataType == 'Number') {
            return r.convertNumber(v);
        }

        return v;
    },
    convertBool: function (v) {
        if ((v === undefined || v === null || v === '')) {
            return null;
        }
        return v === true || v === 'true' || v == 1;
    },
    convertDate: function (v) {

        if (!v) {
            return null;
        }
        if (Ext.isDate(v)) {
            return v;
        }
        return Ext.Date.parse(v, 'c');

    },
    convertNumber: function (v) {
        return v !== undefined && v !== null && v !== '' ?
            parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : null;
    },
    getAttributeValues: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.AttributeValue',
            associationKey: 'values',
            foreignKey: 'attributeId',
            foreignProperty: 'attribute'
        });


    },
    validations: [{
            type: 'length',
            name: 'name',
            min: 3,
            max: 100
        }, {
            type: 'presence',
            name: 'name'
        }, {
            type: 'length',
            name: 'adminName',
            min: 3,
            max: 100
        }, {
            type: 'presence',
            name: 'adminName'
        }
        // { type: 'format', name: 'productCode', matcher: /^[A-z0-9\-]*$/ }
    ],
    proxy: {
        type: 'ajaxproxy',
        // api: {
        //     create: '/admin/app/Test/testCreate',
        //     read: '/admin/Scripts/app/mocks/attributes.json',
        //     update: '/admin/app/Test/testUpdate',
        //     destroy: '/admin/app/Test/testDestroy'
        // },
        api: {
            create: '/admin/app/attribute/create',
            read: '/admin/app/attribute/read',
            update: '/admin/app/attribute/update',
            destroy: '/admin/app/attribute/destroy'
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