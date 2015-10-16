/**
 * @class Taco.model.SearchTuningRule
 */
Ext.define('Taco.model.SearchTuningRule', {
    extend: 'Taco.core.data.Model',
    //behaviors: {  //todo: need behaviors.
    //    read: 24,
    //    create: 25,
    //    update: 26,
    //    destroy: 27
    //},
    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int',
            useNull: true
        }, {
            name: 'code', //required, regex like category/product code.
            type: 'string'
        }, {
            name: 'name',  //required
            type: 'string'
        }, {
            name: 'keywords',
            type: "auto",
            defaultValue: []
        }, {
            name: 'filters',
            type: "auto",
            defaultValue: []
        }, {
            name: 'isActive',
            type: 'boolean',
            defaultValue: true
        }, {
            "name": "status",
            "type": "string",
            persist: false,
            convert: function (value, record) {
                if (!record.get('isActive')) {
                    return 'Disable';
                }
                if (record.get('startDate') || record.get('endDate')) {
                    return 'Scheduled';
                }
                return 'Active';
            }
        }, {
            name: 'isDefault',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'startDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'endDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'boostedProducts',
            type: "auto",
            defaultValue: []
        }, {
            name: 'blockedProducts',
            type: "auto",
            defaultValue: []
        }, {
            name: 'siteId',
            type: 'int'
        }
        //, {
        //    name: "sites",
        //    "type": "auto",
        //    persist: false,
        //    convert: function (value, record) {
        //        if (record.siteId == null) {
        //            var catalogId = record.get('catalogId');

        //            record.sites = Taco.app.context.findSitesByCatalog(catalogId);
        //        }
        //        return record.sites;

        //    }

        //}
    ],

    validations: [
        {field: 'code', type: 'length', max: 30},
        {field: 'name', type: 'length', max: 250}
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/SearchTuningRule/list',
            create: '/admin/app/SearchTuningRule/create',
            update: '/admin/app/SearchTuningRule/edit',
            destroy: '/admin/app/SearchTuningRule/delete'
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