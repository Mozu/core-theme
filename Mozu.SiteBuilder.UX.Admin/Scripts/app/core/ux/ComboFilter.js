/**
 * @class Taco.core.ux.ComboFilter
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.ComboFilter', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco.combofilter',

    createNewOnEnter: true,
    displayField: 'value',
    forceSelection: false,
    grow: true,
    hideTrigger: true,
    propertyField: 'text',
    queryMode: 'local',
    triggerOnClick: false,
    valueField: 'value',

    initComponent: function () {
        if (!this.store) {
            this.store = new Ext.data.Store({
                fields: ['property', 'text', 'value', 'root'],
                data: []
            });
        }

        this.callParent(arguments);

        this.on({
            beforequery: function () { return false; },
            change: this.onValueChange,
            scope: this
        });
    },

    /**
     * Edits a record in the valueStore and instantiates the corresponding itemStore filter.
     * @param  {Ext.data.Model} record The valueStore record being edited
     * @param  {Object} data An object containing key/value pairs
     * @return {Ext.util.Filter} The instantiated filter
     * @private
     */
    buildFilter: function (record, data) {
        var cfg, filter;

        record.beginEdit();
        record.set(data);
        record.endEdit();

        cfg = record.getData();
        filter = Ext.create('Ext.util.Filter', cfg);

        return filter;
    },

    /**
     * Applies an array of filters to the provided itemStore.
     * @param  {Ext.util.Filter[]} records Records from the valueStore.
     * @private
     */
    filterItemStore: function (filters) {
        this.itemStore.clearFilter(true);
        this.itemStore.filter(filters);
    },

    /**
     * Hydrates an array of (incomplete) valueStore records, then returns an array of corresponding filters
     * @param  {Ext.data.Model[]} records The valueStore records
     * @return {Ext.util.Filter[]} The itemStore filters
     */
    getFilters: function (records) {
        var filters = [],
            defaultFilter = Ext.Array.filter(this.filterProperties, function (prop) { return prop.isDefault }).pop();

        Ext.Array.each(records, function (record) {
            var value, filter;

            if (record.get('root') !== 'data') {
                value = record.get('value');

                filter = this.buildFilter(record, {
                    property: defaultFilter.property,
                    text: defaultFilter.text,
                    id: ['filter', value].join('-'),
                    root: 'data'
                });

                filters.push(filter);
            }
        }, this);

        return filters;
    },

    /**
     * Returns a menu of available filter properties
     * @param  {HTMLElement} el The clicked element
     * @return {Ext.menu.Menu} The instantiated menu
     * @private
     */
    getMenu: function (el) {
        var record = this.getRecordByListItemNode(el);

        Ext.destroy(this.menu);
        this.menu = new Ext.menu.Menu({
            plain: true,
            shadow: false,
            cls: Ext.baseCSSPrefix + 'boxselect-item-menu',
            items: this.getMenuItems(record)
        });

        return this.menu;
    },

    /**
     * Returns an array of menu items that change a record and its corresponding filter
     * @param  {Ext.data.Model} record The valueStore record being edited
     * @return {Ext.menu.Item[]} The array of menu items
     * @private
     */
    getMenuItems: function (record) {
        var me = this,
            menuItems = Ext.Array.clone(this.filterProperties);

        Ext.Array.each(menuItems, function (menuItem) {
            function handler (item) {
                var filter = me.buildFilter(record, { property: item.property, text: item.text });

                me.itemStore.filter(filter);
                me.applyMultiselectItemMarkup();
            }
            Ext.apply(menuItem, { handler: handler });
        }, this);

        return menuItems;
    },

    /**
     * Overrides BoxSelect's method. Injects a menuEl into the multiSelectItemTpl.
     * @private
     */
    getMultiSelectItemMarkup: function() {
        var me = this;

        if (!me.multiSelectItemTpl) {
            if (!me.labelTpl) {
                me.labelTpl = Ext.create('Ext.XTemplate',
                    '{[values.' + me.displayField + ']}'
                );
            } else if (Ext.isString(me.labelTpl) || Ext.isArray(me.labelTpl)) {
                me.labelTpl = Ext.create('Ext.XTemplate', me.labelTpl);
            }

            me.multiSelectItemTpl = [
            '<tpl for=".">',
            '<li class="x-boxselect-item ',
            '<tpl if="this.isSelected(values.'+ me.valueField + ')">',
            ' selected',
            '</tpl>',
            '" qtip="{[typeof values === "string" ? values : values.' + me.displayField + ']}">' ,
            '<div class="x-boxselect-item-menu-trigger">{[values.' + this.propertyField + ']}</div>',
            '<div class="x-boxselect-item-text">{[typeof values === "string" ? values : this.getItemLabel(values)]}</div>',
            '<div class="x-tab-close-btn x-boxselect-item-close"></div>' ,
            '</li>' ,
            '</tpl>',
            {
                compile: true,
                disableFormats: true,
                isSelected: function(value) {
                    var i = me.valueStore.findExact(me.valueField, value);
                    if (i >= 0) {
                        return me.selectionModel.isSelected(me.valueStore.getAt(i));
                    }
                    return false;
                },
                getItemLabel: function(values) {
                    return me.getTpl('labelTpl').apply(values);
                }
            }
            ];
        }

        return this.getTpl('multiSelectItemTpl').apply(Ext.Array.pluck(this.valueStore.getRange(), 'data'));
    },

    /**
     * Overrides BoxSelect's method. Looks for a menuEl click before selection.
     * @private
     */
    onItemListClick: function(evt, el, o) {
        var me = this,
        itemEl = evt.getTarget('.x-boxselect-item'),
        closeEl = itemEl ? evt.getTarget('.x-boxselect-item-close') : false,
        menuEl = itemEl ? evt.getTarget('.x-boxselect-item-menu-trigger') : false;

        if (me.readOnly || me.disabled) {
            return;
        }

        evt.stopPropagation();

        if (itemEl) {
            if (closeEl) {
                me.removeByListItemNode(itemEl);
                if (me.valueStore.getCount() > 0) {
                    me.fireEvent('select', me, me.valueStore.getRange());
                }
            } else if (menuEl) {
                me.showMenuByListItemNode(itemEl);
            } else {
                me.toggleSelectionByListItemNode(itemEl, evt.shiftKey);
            }
            me.inputEl.focus();
        } else {
            if (me.selectionModel.getCount() > 0) {
                me.selectionModel.setLastFocused(null);
                me.selectionModel.deselectAll();
            }
            if (me.triggerOnClick) {
                me.onTriggerClick();
            }
        }
    },

    /**
     * Fills in missing fields whenever valueStore is populated with data, then calls filterItemStore.
     * @private
     */
    onValueChange: function (field, newValue, oldValue) {
        var records = this.valueStore.getRange(),
            filters = this.getFilters(records);

        this.filterItemStore(filters);
    },

    /**
     * Shows the menu when a list item's menuEl is clicked.
     * @private
     */
    showMenuByListItemNode: function (el) {
        var menu = this.getMenu(el);

        menu.showBy(el);
    }
});