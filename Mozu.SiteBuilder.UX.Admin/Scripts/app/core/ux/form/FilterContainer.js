/**
 * @class Taco.core.ux.form.FilterContainer
 * @author Jimmy Sanford
 *
 * The base class for a filter container, consisting of three components:
 *
 * - A textfield, which allows simple keyword filtering as well as tokenized advanced filtering;
 * - A dialog window, which contains a form designed for advanced filtering;
 * - A button, which opens and closes the dialog.
 */

Ext.define('Taco.core.ux.form.FilterContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.taco-filtercontainer',
    requires: [
        'Taco.core.ux.form.field.QuickFilter'
    ],

    /**
     * @private
     * @property {String} [currentFilterString={}]
     */
    currentFilterString: '{}',

    /**
     * @cfg {String} [defaultFieldName="keyword"]
     * The key or fieldName to use for textfield input without a corresponding field in the form.
     * When JSON data is sent to the server, this will be used as the key for what the server
     * understands to be a generic or catch-all field.
     */
    defaultFieldName: 'keyword',

    initFromStateManager: true,

    enableQuickFilters: true,
    disableAdvancedSearch: false,
    emptySearchText: '',

    initialValue: null,

    height: 30,
    layout: 'hbox',
    msgTarget: 'qtip',

    initComponent: function () {
        var form;

        this.addEvents(
            /**
             * @event beforefilter
             * Fires before the filter request is sent to the server.
             * Return false to cancel the request.
             */
            'beforefilter',
            /**
             * @event filter
             * Fires after the filter request has been processed by the server.
             */
            'filter'
        );
        
        if (this.initFromStateManager) {
            this.initialValue = (Ext.Array.findBy(Taco.core.StateManager.getCurrentState().metaData.args, function (i) { return i.q; }) || {}).q;
        }
        if (!this.initialValue && this.getAdvancedSearchFromStore()) {
            this.initialValue = this.currentFilterString = this.serializeFilterValue(this.getAdvancedSearchFromStore());
        }

        this.items = [];
        if (!this.disableAdvancedSearch) {
            this.items.push({
                xtype: 'button',
                itemId: 'advancedFilter',
                ui: 'action',
                scale: 'medium',
                glyph: 'XE600@mozicons',
                width: 57,
                margin: '0 10 20 0',
                enableToggle: true,
                scope: this,
                toggleHandler: this.handleButtonToggle
            });
        }

        this.items.push({
            xtype: 'taco-quickfilter',
            itemId: 'textFilter',
            margin: '0 0 20 0',
            msgTarget: 'qtip',
            flex: 1,
            width: 400,
            emptyText: this.emptySearchText,
            handler: this.handleFieldSubmit,
            scope: this
        });

        this.callParent(arguments);

        form = this.getAdvancedForm();

        if (this.quickFilterData && this.enableQuickFilters) {
            form.insert(0, {
                xtype: 'combo',
                itemId: 'quickFilter',
                fieldLabel: 'Quick Filter',
                queryMode: 'local',
                typeAhead: false,
                isSelectField: true,
                emptyText: 'Quick Filter',
                store: this.quickFilterData,
                // value: this.getQuickFilterFromStore(),
                listeners: {
                    change: this.onQuickFilterChange,
                    beforeselect:this.onBeforeSelect,
                    scope: this
                }
            });
        }

        form.getForm().getFields().each(function (field) {
            field.on({
                specialkey: {
                    scope: this,
                    fn: function (field, e) {
                        if (e.getKey() === e.ENTER) {
                            field.up('window').primaryHandler();
                        }
                    }
                }
            });
        }, this);

        this.initFilterStores();

        this.on({
            //beforerender: {
            //    scope: this,
            //    fn: function (cmp) {
            //        this.store.reload();
            //    }
            //},
            boxready: {
                scope: this,
                fn: function (cmp) {
                    if (cmp.initialValue) {
                        var filterField = cmp.down('#textFilter');
                        filterField.setValue(cmp.initialValue);
                        cmp.syncAndFilter(cmp.parseTextFilterValue(filterField));
                    }
                }
            }
        });
    },
    onBeforeSelect:function (combo, record) {
        var newValue = record.get('field1'),
            picker = combo.getPicker();
        if (newValue && combo.findRecordByValue(newValue)) {
            this.syncAndFilter(newValue);
        }
        combo.reset();
        Ext.defer(function () {
            //picker.hide();
            combo.reset();
        }, 1, this);
        return true;
        
    },
    onQuickFilterChange: function (combo, newValue, oldValue) {
        //var params = this.store.getProxy().extraParams = this.store.getProxy().extraParams || {};
        //if (newValue && combo.findRecordByValue(newValue)) {
        //    this.syncAndFilter(newValue);
        //}
        
        
    },

    //getQuickFilterFromStore:function () {
    //    var params = this.store.getProxy().extraParams = this.store.getProxy().extraParams || {};
    //    return params.queryFilter;

    //},

    getAdvancedSearchFromStore: function () {
        var params = this.store.getProxy().extraParams = this.store.getProxy().extraParams || {};
        if (params.advancedSearch) {
            return Ext.JSON.decode(params.advancedSearch);
        }
    },
    /**
     * Send a filter request to the server.
     * 
     * @param  {Object} value An object containing field keys and values.
     */
    doFilter: function (value) {
        var existingFilter = this.getAdvancedSearchFromStore();
        if (existingFilter && Ext.Object.equals(existingFilter, value)) {
            return;
        }
        var filterString = Ext.JSON.encodeValue(value);

        if (filterString === this.currentFilterString) {
            return;
        }
        if (this.store.isLoading()) {
            this.store.abort();
        }


        
        if (this.fireEvent('beforefilter', this, value) !== false) {
            if (this.store.remoteFilter) {

                var params = this.store.getProxy().extraParams = this.store.getProxy().extraParams || {};
                this.store.currentPage = 1;
                this.filtering = true;
                this.currentFilterString = filterString;

                params.advancedSearch = filterString;
                this.store.load({
                    //params: {
                    //    advancedSearch: filterString
                    //},
                    callback: function () {
                        
                        this.fireEvent('filter', this, value);
                        this.filtering = false;
                    },
                    scope: this
                });
            }
        }
    },

    /**
     * Search a store for a record matching the provided value.
     * This method matches string-based user input to a record in the store.
     * 
     * @param  {Ext.data.Store} store The store to search.
     * @param  {String} dataIndex The name of the record field to test.
     * @param  {String} rawValue A string that the field value should begin with.
     * @return {Object} The value of the field, specified by returnIndex, on the record that was found.
     */
    findNearestRecord: function (store, dataIndex, rawValue) {
        return store.getById(rawValue) || store.getById(parseInt(rawValue,10)) || store.findRecord(dataIndex, rawValue, 0, false, false, false);
    },

    /**
     * Instantiate and return the advanced filters form, which will be inserted into the dialog.
     * 
     * @return {Ext.form.Panel} The instantiated form.
     */
    getAdvancedForm: function () {

        if (this.advancedForm && this.advancedForm.isComponent) {
            return this.advancedForm;
        }

        if (this.advancedFormCls) {
            this.advancedForm = Ext.create(this.advancedFormCls);
        } else {
            this.advancedForm = Ext.create('Taco.core.ux.form.Form', this.advancedForm);
        }
        return this.advancedForm;

    },

    /**
     * Respond to the advanced filters button by opening or closing a dialog containing a form.
     * This method will also instantiate the dialog, if necessary.
     * 
     * @param  {Ext.button.Button} button The button.
     * @param  {Boolean} state The next state of the button; true means pressed.
     */
    handleButtonToggle: function (button, state) {
        if (state) {
            if (!this.modal) {
                this.modal = Ext.create('Taco.core.ux.window.Modal', {
                    closeAction: 'hide',
                    title: 'Advanced Filter',
                    primaryText: 'Filter',
                    draggable: false,
                    ui: 'dialog',
                    modal: false,
                    items: this.getAdvancedForm(),
                    listeners: {
                        show: {
                            scope: this,
                            fn: 'handleDialogShow'
                        },
                        close: {
                            scope: this,
                            fn: 'handleDialogClose'
                        },
                        savesuccess: {
                            scope: this,
                            fn: 'handleDialogSave'
                        }
                    }
                });
                this.add(this.modal);
            }

            this.modal.showBy(this.down('#advancedFilter'), 'tl-bl?', [0, 5]);
        } else {
            if (this.modal) {
                this.modal.close();
            }
        }
    },

    /**
     * Respond to the closing of the dialog, regardless of what action triggered the close.
     * This method is responsible for depressing the advanced filters button.
     */
    handleDialogClose: function () {
        this.down('#advancedFilter').toggle(false);

        this.mun(this.up('viewport'), {
            click: {
                element: 'el',
                scope: this,
                fn: 'manageViewportListener'
            }
        });
    },

    /**
     * Respond to a `save` event fired by the dialog.
     * This method triggers an update to the value of the textfield filter, then triggers a filter
     * request to the server.
     */
    handleDialogSave: function () {
        this.syncAndFilter(this.getAdvancedForm().getForm().getValues());
    },

    /**
     * Respond to the opening of the dialog.
     * This method triggers an update to the values of the dialog's form fields.
     */
    handleDialogShow: function () {
        var simple = this.down('#textFilter'),
            jsonValue = this.parseTextFilterValue(simple);

        this.setAdvancedFilterValues(jsonValue);

        this.manageViewportListener(false);
    },

    /**
     * Respond to an attempt to submit the textfield filter.
     * This method triggers a filter request to the server.
     * 
     * @param  {Ext.form.field.Text} field The textfield filter.
     * @param  {Event} e The specialkey event.
     */
    handleFieldSubmit: function (field, e) {
        if (this.modal) {
            this.modal.close();
        }

        this.syncAndFilter(this.parseTextFilterValue(field));
    },

    /**
     * Place this filter's stores in a MixedCollection for reference by key.
     */
    initFilterStores: function () {
        var stores = new Ext.util.MixedCollection();

        if (this.filterStores) {
            stores.addAll(this.filterStores);
        }

        this.getAdvancedForm().getForm().getFields().each(function (field) {
            if (field.store && !stores.getByKey(field.name)) {
                stores.add(field.name, field.store);
            }
        });

        this.filterStores = stores;
    },

    /**
     * Establish a listener to close the dialog when the user clicks outside the dialog.
     * This function doubles as the listener itself.
     * 
     * @param  {Ext.EventObject} e The event object.
     * @param  {HTMLElement} t The target of the event.
     */
    manageViewportListener: function (e, t) {
        if (e === false) {
            // if this method isn't triggered by a click handler, set up the viewport listener
            // the managed listener will be removed when the dialog is closed
            this.mon(this.up('viewport'), {
                click: {
                    element: 'el',
                    scope: this,
                    fn: 'manageViewportListener'
                }
            });
        } else {
            // otherwise check the event and close the dialog if the click wasn't within it
            if (!e.getTarget('#' + this.modal.getId(), 10) && !e.getTarget('#' + this.down('#advancedFilter').getId(), 10)) {
                this.modal.close();
            }
        }
    },

    /**
     * Transform filter data from the textfield filter's raw value, which is a string, into an object.
     * 
     * @param  {Ext.form.field.Text} field The textfield with string data.
     * @return {Object} The object containing field keys and values.
     */
    parseTextFilterValue: function (field) {
        var value = field.getValue(),
            jsonValue = {},
            values,
            lastKey;

        if (!Ext.isEmpty(value)) {
            values = value.split(' ');

            Ext.Array.each(values, function (item, index, all) {
                var colonIndex = item.indexOf(':'),
                    key,
                    val;

                if (colonIndex !== -1) {
                    key = Ext.String.createVarName(item.substr(0, colonIndex));
                    val = item.substr(colonIndex + 1);
                    lastKey = key;

                    jsonValue[key] = val;
                } else {
                    if (index === 0) {
                        key = lastKey = 'keyword';
                        jsonValue[key] = item;
                    } else if (!Ext.isEmpty(lastKey)) {
                        jsonValue[lastKey] = Ext.String.trim([jsonValue[lastKey], item].join(' '));
                    }
                }
            }, this);
        }

        return jsonValue;
    },

    /**
     * Set the values in the advanced filters dialog's form fields.
     * 
     * @param {Object} values The object containing field keys and values.
     */
    setAdvancedFilterValues: function (values) {
        var form,
            comboFields;

        if (this.modal && !Ext.isEmpty(values)) {
            form = this.modal.getForm();
            comboFields = form.query('combo');

            form.getForm().setValues(values);

            if (!Ext.isEmpty(comboFields)) {
                Ext.Array.each(comboFields, function (field) {
                    var potentialValue = values[field.getName()],
                        record = this.findNearestRecord(field.getStore(), field.displayField, potentialValue);

                    field.setValue(record);
                }, this);
            }
        }
    },

    /**
     * Set the value of the textfield filter.
     * 
     * @param {Object} values The object containing field keys and values.
     */
    setTextFilterValue: function (values) {
        var field = this.down('#textFilter'),
            simpleValue = this.serializeFilterValue(values);

        field.setValue(simpleValue);
    },


    serializeFilterValue:function (values) {
        var simpleValue = [];

        Ext.Object.each(values, function (fieldName, rawValue) {
            if (!Ext.isEmpty(rawValue)) {
                if (fieldName === this.defaultFieldName) {
                    simpleValue.push(rawValue);
                } else {
                    if (Ext.isDate(rawValue)) {
                        simpleValue.push([fieldName, Ext.Date.format(rawValue, 'c')].join(':'));
                    } else {
                        simpleValue.push([fieldName, rawValue].join(':'));
                    }
                }
            }
        }, this);

        return Ext.String.trim(simpleValue.join(' '));
    },

    /**
     * Iterate over a values object, producing one version for the textfield filter and another for
     * submission to the server, then update the textfield filter and submit the filter request.
     * 
     * @param  {Object} values The values object.
     * @return {Object} The nested values object, containing both textfield and JSON values objects.
     */
    syncAndFilter: function (values) {
        var form = this.getAdvancedForm(),
            stores = this.filterStores,
            syncedValues = {};

        syncedValues['json'] = Ext.apply({}, values);
        syncedValues['text'] = Ext.apply({}, values);

        Ext.Object.each(values, function (fieldName, rawValue) {
            var displayField,
                record;

            if (Ext.isEmpty(rawValue)) {
                delete syncedValues['json'][fieldName];
                delete syncedValues['text'][fieldName];
            }

            if (stores.containsKey(fieldName)) {
                displayField = form.getForm().findField(fieldName).displayField;

                record = this.findNearestRecord(stores.getByKey(fieldName), displayField, rawValue);

                if (record) {
                    syncedValues['json'][fieldName] = record.getId();
                    syncedValues['text'][fieldName] = record.get(displayField);
                } else {
                    delete syncedValues['json'][fieldName];
                    delete syncedValues['text'][fieldName];
                }
            }
        }, this);

        this.setTextFilterValue(syncedValues['text']);
        this.doFilter(syncedValues['json']);

        return syncedValues;
    }
});