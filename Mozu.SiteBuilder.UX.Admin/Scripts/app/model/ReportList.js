/**
 * @class Taco.model.LocationType
 */
Ext.define('Taco.model.ReportList', {
    extend: 'Taco.core.data.Model',
    idProperty: "reportId",

    fields: [
        'reportId',
        'chartioId',
        'name',
        'ordinality',
        'description'
    ],




    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/report/list/read'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});