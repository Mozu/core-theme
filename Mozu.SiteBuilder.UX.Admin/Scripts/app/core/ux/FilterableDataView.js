/**
 * @class Taco.core.ux.FilterableDataView
 */

Ext.define('Taco.core.ux.FilterableDataView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.filterabledataview',

    cls: Taco.baseCSSPrefix + 'filterabledataview',

    layout: {
        type: 'card',
        align: 'stretch'
    },

    flex: 1,

    requires: ['Taco.core.ux.TextFilter', 'Taco.core.ux.IconSizeSlider', 'Taco.core.ux.ListGridToggle'],
    items: [{
        overflowY: 'scroll',
        xtype: 'gridpanel',
        enableColumnResize: false,
        enableColumnMove: false,
        preventHeader: true,
        sortableColumns: false,
        simpleSelect: true
    }, {
        xtype: 'dataview',
        overflowY: 'scroll',
        simpleSelect: true,
        itemSelector: 'div.taco-datalist-item'
    }],
    tbar: [
        {
            xtype: 'textfilter',
            emptyText: 'Search...',
            width: 150,
            margin: '0 20'
        }, {
            xtype: 'splitbutton',
            text: 'Sort by...',
            width: 140,
            handler: function () {
                this.maybeShowMenu();  // undocumented Button function. TODO: refactor.
            },
            menu: {
                xtype: 'menu',
                activeItem: 0,
                plain: true,
                listeners: {
                    click: function (menu, item) {
                        var store = menu.ownerButton.view.store;
                        if (item) {
                            menu.ownerButton.setText(item.text);
                            store.sorters.removeAtKey(menu.id);
                            store.sorters.add(menu.id, item);
                            store.load();

                        }
                    }
                },
                items: [
                    {
                        text: "Newest First",
                        property: 'dateCreated',
                        direction: 'ASC'
                    }
                ]
            }
        },
        {
            xtype: 'iconsizeslider',
            hidden: true,
            margin: '0 20'
        },
        '->',
        {
            xtype: 'listgridtoggle',
            handler: function (type) {
                this.view._syncSelection(type)
                         .getLayout().setActiveItem(type == 'grid' ? 0 : 1);
            },
            margin: '0 20'
        }
    ],

    getSelectedItems: function () {
        var currentView = this.getLayout().getActiveItem();

        if ('getSelectionModel' in this) {
            currentView = this.view;
        }

        return currentView.getSelectionModel().getSelection();

    },

    _syncSelection: function (target) {
        var oldModel, newModel;
        if (target === "grid") {
            oldModel = this.items.get(1).getSelectionModel(); // dataview is a plain view
            newModel = this.items.get(0).view.getSelectionModel(); // gridPanel has view property with view in it
        } else {
            oldModel = this.items.get(0).view.getSelectionModel(); // gridPanel has view property with view in it
            newModel = this.items.get(1).getSelectionModel(); // dataview is a plain view
        }

        newModel.select(oldModel.getSelection());

        return this;
    },

    initComponent: function (eOpts) {
        var me = this;
        // define search param in "Search" box
        this.tbar[0].param = this.searchParam;

        // add filters to "Sort By" menu
        this.tbar[1].menu.items = Ext.Array.merge(this.tbar[1].menu.items, this.sorters);

        // sorter menu needs a filterabledataview reference
        this.tbar[1].view = this;

        // slider needs a filterabledataview reference
        this.tbar[2].view = this;

        // list/grid switch needs a filterabledataview reference
        this.tbar[4].view = this;

        // apply defaults to grid columns
        this.items[0].columns = ([
            {
                xtype: "gridcolumn",
                tdCls: Ext.baseCSSPrefix + 'grid-cell-selection',
                width: 40,
                renderer: function () {
                    return "<div class=\"taco-datalist-" + me.selectionMode + "\"></div>";
                },

                defaultRenderer: function (value) {
                    return value;
                }
            }
        ]).concat(Ext.Array.map(this.columns, function (column) {
            return Ext.applyIf(column, {
                sortable: false,
                hideable: false,
                menuDisabled: true,
                resizable: false
            });
        }));

        // add emptyText based on type, which is object name
        var emptyText = '<p class="taco-datalist-emptytext">No ' + this.type + ' to display!</p>';
        this.items[1].emptyText = emptyText;
        this.items[0].viewConfig = {
            emptyText: emptyText
        };

        // create xTemplate based on searchParam, which is almost always object name

        this.items[1].tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="taco-datalist-item">',
                    '<div class="taco-datalist-' + this.selectionMode + '"></div>',
                    '<p>{' + this.searchParam + '}</p>',
                '</div>',
            '</tpl>'
        )

        // attach store references
        var store = this.store;
        this.items[0].store = store;
        this.items[1].store = store;

        // load
        store.load();
        this.callParent(arguments);

        // add listener to hide and show slider
        var iconView = this.items.get(1),
            slider = this.dockedItems.get(0).items.get(2);
        iconView.mon(iconView, {
            scope: slider,
            activate: slider.show,
            deactivate: slider.hide
        });
    }
});