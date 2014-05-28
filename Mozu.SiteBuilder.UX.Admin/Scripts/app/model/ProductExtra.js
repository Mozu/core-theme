/**
* @class Taco.model.ProductExtra
* @author Chris Missal
*/

Ext.define('Taco.model.ProductExtra', {
    extend: 'Taco.core.data.Model',
    requires:'Taco.model.ProductExtraValue',
    fields:
    [
        {
            name: 'attributeFQN',
            type: 'string',
            useNull: true
        },
        {
            name: 'values',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'product',
            type: 'auto',
            persist: false
        }, {
            name: 'isRequired',
            type: 'bool',
            defaultValue: false
        }
    ],

    idProperty: 'attributeFQN',
    getValues: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ProductExtraValue',
            associationKey: 'values'
        });
    },
});