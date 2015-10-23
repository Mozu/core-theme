/**
 * @class Taco.model.StorefrontProduct
 * Models a ProductRuntime product
 * @extends Taco.core.data.Model * 
 */
Ext.define("Taco.model.StorefrontProduct", {
    extend: "Taco.core.data.Model",

    /*behaviors: {
        read: 4
    },*/

    idProperty: "productCode",
    fields: [
        { name: "productCode", type: "string" },
        { name: "name", type: "string" },
        { name: "goodsType", type: "string" },
        { name: "productTypeId", type: "int", useNull: true },
        { name: "productType", type: "string" },
        { name: "productUsage", type: "string" },
        { name: "publishState", type: "string" },
        { name: "isTaxable", type: "bool", useNull: true },
        { name: "isRecurring", type: "bool", useNull: true },
        { name: "price", type: "float", useNull: true},
        { name: "salePrice", type: "float", useNull: true},
        { name: "dateFirstAvailableInCatalog", type: "date", useNull: true, dateFormat: "c"},
        { name: "catalogStartDate", type: "date", useNull: true, dateFormat: "c" },
        { name: "catalogEndDate", type: "date", useNull: true, dateFormat: "c" },
        { name: "daysAvailableInCatalog", type: "int", useNull: true },
        { name: "variationProductCode", type: "string" },
        { name: "createDate", type: "date", "useNull": true, dateFormat: "c" }
    ],
    formatCurrency: function (value) {
        return Taco.app.context.getCurrent().formatCurrency(value);
    }
});