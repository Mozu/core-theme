/**
 * @class Taco.model.ProductTypeAttribute
 */
Ext.define('Taco.model.ProductTypeAttribute', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'attributeFQN', type: 'string' },
        { name: 'adminName', type: 'string' },
        { name: 'productTypeId', type: 'auto' },
        { name:'index', type: 'int' },
        { name: 'isLocked', type: 'boolean', defaultValue: false },
        { name: 'isRequired', type: 'boolean', defaultValue: false },
        { name: 'allowMulti', type: 'boolean', defaultValue: false },
        { name: 'isHidden', type: 'boolean', defaultValue: false },
        { name: 'isAdminOnly', type: 'boolean', defaultValue: false },
        { name: 'isProductDetailsOnlyProperty', type: 'boolean', defaultValue: false },
        { name: 'attributeName', type: 'string', persist: false },
        { name: 'allValues', type: 'auto', persist: false, defaultValue: [] },
        { name: 'selectedValues', type: 'auto', defaultValue: [] },
        { name: 'dataType', type: 'string' },
        { name: 'inputType', type: 'string' },
        { name: 'attributeMetadata', type: 'auto', persist: false, defaultValue: [] },
        { name: 'order', type: 'int' }
        
    ],
    getAttributeMetaDataValue:function (key) {
        var val;
        Ext.each(this.get('attributeMetadata'), function (kvp) {
            if (kvp.key == key) {
                val = kvp.value;
            }
        });
        return val;
    },

    idProperty: 'attributeFQN',
    proxy: {
        type: 'ajaxproxy',
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
