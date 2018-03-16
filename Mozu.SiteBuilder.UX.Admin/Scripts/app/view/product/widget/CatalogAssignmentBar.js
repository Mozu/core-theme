Ext.define('Taco.view.product.widget.CatalogAssignmentBar', {
    extend: 'Ext.container.Container',
    requires: [
        'Taco.core.ux.LightTag',
        'Taco.core.ux.picker.InlineSelector',
        'Taco.core.ux.picker.Selector'
    ],

    cls: 'taco-catalog-selector-bar',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    initComponent: function() {

        this.addEvents(['select']);

        this.masterCatalog = Taco.app.context.getMasterCatalog();
        this.catalogs = this.buildCatalogConfig(this.catalogs);

        this.callParent(arguments);

        this.rebuildSelectors();
    },

    redraw: function(catalogs) {
        this.catalogs = this.buildCatalogConfig(catalogs);
        this.rebuildSelectors();
    },

    rebuildSelectors: function () {
        this.selectors = [];

        this.buildMasterCatalogContext();
        this.buildCatalogContext();

        this.removeAll();
        this.add(this.selectors);
    },

    buildMasterCatalogContext: function () {
        this.selectors.push(Ext.widget({
            disableTrigger: true,
            highlighted: true,
            labelText: 'Master',
            listeners: {
                select: this.handleSelect,
                scope: this
            },
            selectionType: 'master',
            store: [
                [this.masterCatalog.id, this.masterCatalog.name]
            ],
            tagText: 'master',
            value: this.masterCatalog.id,
            xtype: 'taco.pickerselector'
        }));
    },

    buildCatalogContext: function () {
        var data = [],
            triggerData = [],
            defaultValue;

        Ext.each(this.catalogs, function (catalog) {
            data.push([catalog.id, catalog.name, catalog.isOverridden]);
        }, this);

        Ext.each(this.masterCatalog.catalogs, function (catalog) {
            triggerData.push([catalog.id, catalog.name]);
        }, this);

        defaultValue = data.length > 0 ? data[0][0] : '';

        this.selectors.push(Ext.widget({
            highlighted: false,
            labelText: 'Catalogs',
            listeners: {
                select: this.handleSelect,
                scope: this
            },
            store: data,
            tagText: 'catalog',
            triggerCallToActionText: 'Assign to Catalogs:',
            triggerData: triggerData,
            triggerSelected: data,
            value: defaultValue,
            xtype: 'taco.inlineselector'
        }));
    },

    handleSelect: function (selector, record) {
        Ext.each(this.selectors, function (selector) {
            selector.highlight(false);
        });

        selector.highlight();

        record.set('type', selector.selectionType || 'catalog');

        this.fireEvent('select', this, record);
    },

    buildCatalogConfig: function(catalogs) {

        var catalogItems = [];
        var isOverridden;

        Ext.Array.each(catalogs.data.items, function (cat) {
            if (cat && cat.catalog) {
                catalogItems.push({
                    name: cat.catalog.name,
                    id: cat.catalog.id,
                    isOverridden: cat.get('isContentOverridden') || cat.get('isPriceOverridden') || cat.get('isSEOContentOverridden')
                });
            }
        });

        return catalogItems;
    }
});