/**
 * @class Taco.model.SortDefinition
 */
Ext.define('Taco.model.SortDefinition', {
    extend: 'Taco.core.data.Model',
    idProperty: 'id',
    fields: [
        {
            name: 'id', //required for server side.
            type: 'string'
        }, {
            name: 'name',  //required
            type: 'string'
        }, {
            name: 'startDate',
            type: 'string'
        }, {
            name: 'endDate',
            type: 'string'
        }
    ],

    getSites: function(isCatalogLevel) {
        var site,
            catalog,
            sites;
        if (!(Taco.app && Taco.app.context)){
            return [];
        }
        if (isCatalogLevel) {
            catalog = Taco.app.context.getContextAtLevel('c');
            sites = catalog.getSites();
        } else {
            site = Taco.app.context.getContextAtLevel('s');
            sites = [];
            sites.push(site);
        }
        return Ext.Array.map(sites, function(site) {
            return { id: site.id, name: site.name };
        });
    },

    getDeletePromptMessage: function() {
        var msg = 'Are you sure you want to delete "' + this.get('name') + '"?';
        return msg;
    },

    validations: [],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/productsortdefinition/list',
            destroy: '/admin/app/productsortdefinition/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});
