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
    propertyField: 'property',
    queryMode: 'local',
    triggerOnClick: false,
    valueField: 'value',

    initComponent: function () {
        if (!this.store) {
            this.store = new Ext.data.Store({
                fields: ['property', 'value'],
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
     * Creates filters and applies them to the provided itemStore.
     * @param  {Ext.data.Model[]} records Records from the valueStore.
     * @private
     */
    filterItemStore: function (records) {
        var filters = Ext.Array.map(records, function (record) {
            var cfg = Ext.applyIf(record.getData(), { root: 'data' });
            return Ext.create('Ext.util.Filter', cfg);
        }, this);

        this.itemStore.clearFilter(true);
        this.itemStore.filter(filters);
    },

    getMenu: function () {
        if (!this.menu) {
            this.menu = new Ext.menu.Menu({
                plain: true,
                shadow: false,
                cls: Ext.baseCSSPrefix + 'boxselect-item-menu',
                items: this.getMenuItems()
            });
        }

        return this.menu;
    },

    getMenuItems: function () {
        return [];
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
        var records = this.valueStore.getRange();

        Ext.Array.each(records, function (record) {
            if (Ext.isEmpty(record.get('property'))) {
                record.set('property', 'productName');
                record.setId(['productName', record.get('value')].join('-'));
            }
        }, this);

        if (this.itemStore) {
            this.filterItemStore(records);
        }
    },

    /**
     * Shows the menu when a list item's menuEl is clicked.
     * @private
     */
    showMenuByListItemNode: function (el) {
        var menu = this.getMenu();

        menu.showBy(el);
    }
});