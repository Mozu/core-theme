/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.TargetRule', {
    extend: 'Taco.core.data.Model',
    idProperty:"code",
    fields: [
        {
            "name": "code",
            "type": "string"
        }, {
            "name": "domain",
            "type": "string"
        }, {
            "name": "description",
            "type": "string"
        }, {
            "name": "expression",
            "type": "string"
        }
    ]
});
