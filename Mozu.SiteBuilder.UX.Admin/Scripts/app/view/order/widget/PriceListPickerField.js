/**
 * @class Taco.view.order.widget.PriceListPickerField
 */
Ext.define('Taco.view.order.widget.PriceListPickerField', {
    extend: 'Ext.form.field.ComboBox',
    requires: ['Taco.store.PriceLists'],

    config: {
        /** Provide the site Id so we can mark the default price list. */
        orderSiteId: ''
    },

    emptyText: "None",
    selectOnFocus: false,
    forceSelection: true,
    triggerAction: "all",
    editable: false,
    flex: 1,
    listConfig: {
        loadingText: 'Searching...',
        emptyText: 'No matching price lists found.'
    },

    displayField: 'name',
    valueField: 'code',
    minChars: 1,
    queryMode: 'local',
    lastQuery:"",
    excludedIds:[],
    excludedCode: null,

    initComponent: function(eOpts) {
        var me = this;

        me.listConfig.tpl =
            Ext.create('Ext.XTemplate',
                '<ul>' +
                    '<tpl for=".">' +
                        '<li role="option" class="' + Ext.baseCSSPrefix + 'boundlist-item">' +
                            "<span class='name'>{name}</span>" +
                            "<tpl if='filteredInStorefront'> (Exclusive)</tpl>" +
                            "{[this.isDefault(values.defaultForSites)]}" +
                        '</li>' +
                    '</tpl>' +
                '</ul>',
                {
                    isDefault: function(sites) {
                        return sites.indexOf(me.orderSiteId) >= 0 ? " (Default)" : "";
                    }
                }
            );

        me.callParent(arguments);
    }
});
