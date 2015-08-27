/**
 * @class Taco.core.ux.ComboFilter
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.ComboFilter', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco.combofilter',

    createNewOnEnter: true,
    displayField: 'display',
    forceSelection: false,
    grow: true,
    hideTrigger: false,
    propertyField: 'text',
    queryMode: 'local',
    triggerOnClick: false,
    valueField: 'value',

    initComponent: function () {
        if (!this.store) {
            this.store = new Ext.data.Store({
                fields: [
                    { name: 'property', type: 'string' },
                    { name: 'value', type: 'string' },
                    { name: 'display', type: 'string' },
                    { name: 'text', type: 'string' },
                    { name: 'root', type: 'string' }
                ],
                data: []
            });
        }

        this.callParent(arguments);

        this.on({
            beforequery: function () { return false; },
            change: this.onValueChange,
          //  keypress: function(){console.log('ere')},
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
    buildFilter: function (record, data, filterFn) {

        var cfg, filter;

        record.beginEdit();
        record.set(data);
        record.endEdit();

        cfg = record.getData();
        
        cfg.filterFn = filterFn;
        filter = Ext.create('Ext.util.Filter', cfg);
        filter.scope = this.scope;
        
        if (filterFn) {

            filter.filterFn = function (record) {
                return filterFn.apply(filter.scope || filter, [record, filter]);
            };
        }

        return filter;
    },

    /**
     * Applies an array of filters to the provided itemStore.
     * @param  {Ext.util.Filter[]} filters An array of filter instances
     * @private
     */
    filterItemStore: function (filters) {
        this.itemStore.clearFilter(true);
        if (filters == '') {
            //need to not surpress the reload event when removing the filter
            this.itemStore.clearFilter();
            return;
        }
        this.itemStore.filter(filters);
    },

    /**
     * Returns the attached floating menu that contains the filter form.
     * @return {Ext.menu.Menu} The attached menu
     * @private
     */
    getFilterForm: function () {
        var form = this.filterForm,
            saveAction;

        if (!form.isMenu && Ext.isObject(form)) {
            Ext.apply(form, { itemId: 'form' });

            form = Ext.create('Taco.core.ux.form.Form', form);

            saveAction = Ext.create('Ext.button.Button', {
                ui: 'link',
                scale: 'medium',
                text: 'Apply',
                scope: this,
                handler: this.onFilterFormSubmit
            });

            this.filterForm = Ext.create('Ext.menu.Menu', {
                plain: true,
                shadow: false,
                bodyPadding: 20,
                cls: Taco.baseCSSPrefix + 'combofilter-form-menu',
                // layout: {
                //     type: 'vbox'
                // },
                items: [{
                    xtype: 'component',
                    cls: Taco.baseCSSPrefix + 'combofilter-form-title',
                    html: 'Search By',
                    autoEl: {
                        tag: 'h2'
                    }
                }, form, {
                    xtype: 'container',
                    cls: Taco.baseCSSPrefix + 'combofilter-form-actions',
                    items: [saveAction]
                }]
            });

            this.filterForm.on({
                show: this.updateFilterForm,
                scope: this
            });

            this.mon(this.itemStore, 'refresh', this.updateFilterForm, this);
        }

        return this.filterForm;
    },

    /**
     * Hydrates an array of (incomplete) valueStore records, then returns an array of corresponding filters.
     * @param  {Ext.data.Model[]} records The valueStore records
     * @return {Ext.util.Filter[]} The itemStore filters
     */
    getFilters: function (records) {
        var filters = [],
            defaultFilter = Ext.Array.filter(this.filterProperties, function (prop) { return prop.isDefault }).pop(),
            valueStoreChanged = false;

        Ext.Array.each(records, function (record) {
            var value = record.get('value'),
                filter;

            if (record.get('root') !== 'data') {
                value = record.get('value');

                filter = this.buildFilter(record, {
                    property: record.get('property') || defaultFilter.property,
                    text: record.get('text') || defaultFilter.text,
                    id: ['filter', value].join('-'),
                    root: 'data'
                });

                filters.push(filter);
                valueStoreChanged = true;
            } else {
                filter = this.itemStore.filters.get(['filter', value].join('-'));
                filters.push(filter);
            }
        }, this);

        if (valueStoreChanged) {
            this.valueStore.fireEvent('datachanged', this.valueStore);
        }

        return filters;
    },

    /**
     * Returns a menu of available filter properties.
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
     * Returns an array of menu items that change a record and its corresponding filter.
     * @param  {Ext.data.Model} record The valueStore record being edited
     * @return {Ext.menu.Item[]} The array of menu items
     * @private
     */
    getMenuItems: function (record) {
        var me = this,
            menuItems = Ext.clone(this.filterProperties);

        Ext.Array.each(menuItems, function (menuItem) {
            function handler (item) {
                var cfg, filter, filterCache;

                cfg = {
                    property: item.property,
                    text: item.text
                };
                filter = me.buildFilter(record, cfg, item.filterFn);
                
                // the filter must be replaced, then the store's filters must be cleared and re-applied
                // when we clear the store, filters are removed (not deactivated), so cache them
                me.itemStore.filters.replace(filter);
                filterCache = me.itemStore.filters.clone();
                me.filterItemStore(filterCache.getRange());
                me.applyMultiselectItemMarkup();
            }
            Ext.apply(menuItem, {
                plain: true,
                handler: handler
            });
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
     * Applies form field values to the input field and hides the menu.
     * @private
     */
    onFilterFormSubmit: function () {
        
        var values = this.filterForm.items.get('form').getValues(),
            model = this.valueStore.getProxy().getModel(),
            filters;

        filters = Ext.Array.filter(this.filterProperties, function (item) {
            return values.hasOwnProperty(item.property);
        }, this);

        filters = Ext.Array.map(filters, function (item) {
            Ext.apply(item, {
                value: values[item.property],
                display: values[item.property]
            });
            return Ext.isEmpty(item.value) ? null : model.create(item);
        }, this);

        filters = Ext.clean(filters);

        this.setValue(filters);
        this.filterForm.hide();
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
        var records, filters;
        if (!newValue && !oldValue) return;

        records = this.valueStore.getRange();
        filters = this.getFilters(records);

        this.filterItemStore(filters);
    },

    /**
     * Opens the attached form when the trigger is clicked, generating it if necessary.
     * @param  {Ext.EventObject} e The click event
     * @private
     */
    onTriggerClick: function (e) {
        var form = this.getFilterForm();

        if (form) form.showBy(this, 'tl-bl?', [2, 2]);
    },

    /**
     * Shows the menu when a list item's menuEl is clicked.
     * @private
     */
    showMenuByListItemNode: function (el) {
        var menu = this.getMenu(el);

        menu.showBy(el);
    },

    /**
     * Update the filter form to match a set of filter values.
     * @param  {Ext.util.Filter[]} filter The set of filter instances
     * @private
     */
    updateFilterForm: function () {
        var menu = this.filterForm,
            filters = Ext.Array.merge([], this.itemStore.filters.getRange()),
            form;

        if (!menu) {
            return;
        }

        form = menu.items.get('form');
        form.getForm().reset();

        Ext.Array.each(filters, function (filter) {
            var field = form.getForm().findField(filter.property);

            if (field) {
                field.setValue(filter.value);
            }
        }, this);
    }
});