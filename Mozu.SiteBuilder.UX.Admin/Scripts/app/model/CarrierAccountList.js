Ext.define('Taco.model.CarrierAccountList', {
    extend: 'Taco.core.data.Model',
    idProperty: 'code',
    fields: [
        { name: "carrierId", type: "string" },
        { name: "code", type: "string" },
        { name: "values", type: "auto", defaultValue: {} },
        { name: "name", type: "string" },

    ],
});