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
        'Taco.core.ux.form.field.QuickFilter',
        'Taco.core.util.Filter'
    ],

    /**
     * @private
     * @property {String} [currentFilterString={}]
     */
    currentFilterString: '{}',

    /**
     * The characters to use for delimiting field from value 
     */
    keyValueDelimiter: ':',

    /**
     * Used to cached adv search field names for comparison to user entered keys
     */
    advSearchFields: null,

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

        // force the form to reset to clean state; this allows the form to be reset to empty values; otherwise the form will reset to the values that initialized it.
        form.trackResetOnLoad = false;

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
                            var picker = (field.getPicker) ? field.getPicker() : null;
                            
                            if (picker && picker.isVisible()) {                                
                                // ignore enter key when the combo has a picker that is visible. enter key will select a value in picker
                            } else {
                                field.up('window').primaryHandler();
                            }
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

        this.mon(Taco.app.context, {
            contextchange: this.onGlobalContextChange,
            scope: this
        });

    },

    onBeforeSelect:function (combo, record) {
        var newValue = record.get('field1'),
            picker = combo.getPicker();
        
        if (newValue && combo.findRecordByValue(newValue)) {
            this.setAdvancedFilterValues(newValue);
            this.setTextFilterValue(newValue);
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
        if (this.hasContextChanged) {
            this.hasContextChanged = false;
        }
        else if (existingFilter && Ext.Object.equals(existingFilter, value)) {
            return;
        }
        
        // need to format dates before jsonEncoding the value to maintain the timezone information;
        Ext.Object.each(value, function (fieldName, rawValue) {
            if (!Ext.isEmpty(rawValue)) {                
                if (Ext.isDate(rawValue)) {
                    value[fieldName] = Ext.Date.format(rawValue, 'c');
                }
            }
        }, this);
        
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
        return store.getById(rawValue) || store.getById(parseInt(rawValue, 10)) || store.findRecord(dataIndex, rawValue, 0, false, false, false);
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
                    // had to override the layout on this becuase invalidattion messages in the forms was causing a scroll to happen.
                    // see: http://www.sencha.com/forum/showthread.php?184206-Change-in-validation-state-causes-form-to-scroll/page2
                    layout: {type: 'vbox', align: 'stretch'},
                    modal: false,                    
                    items:this.getAdvancedForm(),
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
        var doc, collapseIf;

        if (!this.isDestroyed && !this.modal.isDestroyed) {
            doc = Ext.getDoc();
            collapseIf = this.collapseIf;

            doc.un('mousewheel', collapseIf, this);
            doc.un('mousedown', collapseIf, this);

            this.down('#advancedFilter').toggle(false);
        }
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
    handleDialogShow: function (dialog) {
        var simple = this.down('#textFilter');
        var jsonValue = this.parseTextFilterValue(simple);
        var collapseIf;
        
        if (dialog.rendered && !dialog.isDestroyed) {
            collapseIf = this.collapseIf;

            this.mon(Ext.getDoc(), {
                mousewheel: collapseIf,
                mousedown: collapseIf,
                scope: this
            });
            
            // annoyingly the form fields do not reset because they are updating the original value when they are being set.
            // clear out any previuos values left in the form from previous showing.
            var form = dialog.getForm().form,
                fields = form.getFields().items,
                fLen = fields.length;
                Ext.suspendLayouts();

            for (var f = 0; f < fLen; f++) {
                var field = fields[f];
                // need to manually null out the original value since the setValues on the form sets this value on the field and it never resets to empty;
                field.originalValue = null;
                field.reset();
            }
            Ext.resumeLayouts(true);
        }

        this.setAdvancedFilterValues(jsonValue);
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
     * Transform filter data from the textfield filter's raw value, which is a string, into an object.
     * 
     * @param  {Ext.form.field.Text} field The textfield with string data.
     * @return {Object} The object containing field keys and values.
     */
    parseTextFilterValue: function (field) {
        return Taco.core.util.Filter.toJSON(field.getValue(), this.getAdvSearchFieldNames(), this.keyValueDelimiter);
    },

    isFieldSupported: function (key) {
        var match;
        if (!this.advancedForm || !key) {
            return !(!key);
        }
        if (!this.advSearchFields) {
            this.advSearchFields = Ext.Array.pluck(this.advancedForm.query('[name]'), 'name');
        }
        match = Ext.Array.findBy(this.advSearchFields, function (fld) {
            return (fld.toLowerCase() === key.toLowerCase());
        });
        return match !== null;
    },

    //returns names of each adv search field and caches result.
    getAdvSearchFieldNames: function() {
        if (this.advSearchFields)
            return this.advSearchFields;

        if (!this.advancedForm) {
            return [];
        }
        this.advSearchFields = Ext.Array.pluck(this.advancedForm.query('[name]'), 'name');
        return this.advSearchFields;
    },


    /**
     * Set the values in the advanced filters dialog's form fields.
     * 
     * @param {Object} values The object containing field keys and values.
     */
    setAdvancedFilterValues: function (values) {
        var form,
            comboFields;

        
        //if (this.modal && !Ext.isEmpty(values)) {
        if (this.modal && !Ext.Object.isEmpty(values)) {
        
            form = this.modal.getForm();
            comboFields = form.query('combo');
            
            // reload the values using the current state pulled from the search box.
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
        var me = this,
            simpleValue = [];

        Ext.Object.each(values, function (fieldName, rawValue) {
            if (!Ext.isEmpty(rawValue)) {                
                if (fieldName === this.defaultFieldName) {
                    simpleValue.push(rawValue);
                } else {
                    if (Ext.isDate(rawValue)) {
                        simpleValue.push([fieldName, Ext.Date.format(rawValue, 'c')].join(me.keyValueDelimiter));
                    } else {
                        simpleValue.push([fieldName, rawValue].join(me.keyValueDelimiter));
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
        var me = this,
            form = me.getAdvancedForm(),
            stores = me.filterStores,
            syncedValues = {},
            remoteFilterCalls = [];

        syncedValues['json'] = Ext.apply({}, values);
        syncedValues['text'] = Ext.apply({}, values);
        
        function finalCallback() {
            //keep calling this finalCallback until all of the queued up calls have completed;

            if (Ext.Array.findBy(remoteFilterCalls, function(task) {
                return task.loading;
            })) {
                //wait until all remote records have loaded;
                return;
            };
            
            me.setTextFilterValue(syncedValues['text']);
            me.doFilter(syncedValues['json']);
        }

        function processRecord(task) {
            var fieldName = task.fieldName,
                displayField = task.displayField,
                record = task.record;

            if (record) {
                syncedValues['json'][fieldName] = record.getId();
                syncedValues['text'][fieldName] = record.get(displayField);
            } else {
                delete syncedValues['json'][fieldName];
                delete syncedValues['text'][fieldName];
            }
        }

        Ext.Object.each(values, function (fieldName, rawValue) {
            var displayField,
                record;

            if (Ext.isEmpty(rawValue)) {
                delete syncedValues['json'][fieldName];
                delete syncedValues['text'][fieldName];
            } else {

                if (stores.containsKey(fieldName)) {
                    displayField = form.getForm().findField(fieldName).displayField;

                    var store = stores.getByKey(fieldName),
                        isRemoteFilter = store.remoteFilter;

                    record = this.findNearestRecord(store, displayField, rawValue);

                    if (record) {
                        processRecord({
                            fieldName: fieldName,
                            displayField: displayField,
                            record: record
                        });
                    } else {
                        if (isRemoteFilter) {
                            // have store query the service for the record;
                            remoteFilterCalls.push({
                                loading: true,
                                fieldName: fieldName,
                                displayField: displayField,
                                rawValue: rawValue,
                                store: store,
                                record: null
                            });
                        } else {
                            // need to clear out any queries that don't come back in local store
                            delete syncedValues['json'][fieldName];
                            delete syncedValues['text'][fieldName];
                        }
                    }
                    
                        //syncedValues['json'][fieldName] = record.getId();
                        //syncedValues['text'][fieldName] = record.get(displayField);
                } else {

                    //syncedValues['json'][fieldName] = rawValue;
                    //syncedValues['text'][fieldName] = rawValue;

                    //delete syncedValues['json'][fieldName];
                    //delete syncedValues['text'][fieldName];
                }
            }
            

        }, this);

        if (remoteFilterCalls.length) {

            Ext.Array.each(remoteFilterCalls, function (task) {

                var options = {
                    params: {
                        query: task.rawValue
                    },
                    callback: function(records, operation, success) {
                        task.loading = false;
                        task.record = records[0];
                        processRecord(task);
                        finalCallback();
                    },
                    rawQuery: true
                };

                task.store.load(options);
            });
        }

        finalCallback();
        

        return syncedValues;
    },

    collapseIf: function (e, t) {
        var modal = this.modal;
        var button = this.down('#advancedFilter');

        if (modal && button && !this.isDestroyed && !modal.isDestroyed && !e.within(modal.el, false, true) && !e.within(button.el) && !e.getTarget('.x-layer', 10)) {

            var target = Ext.fly(e.target);
            var isMask = target.hasCls("x-mask");
            var isBoundList = target.up('.x-boundlist');
            //need to check to see if user is interacting with a combo boundlist or its loading mask;
            if (isMask || isBoundList) {
                return;
            }
            modal.close();
        }
    },

    onGlobalContextChange: function (context) {
        if (context.urlToken === this.urlToken) {
            return;
        }
        this.hasContextChanged = true;
        this.urlToken = context.urlToken;
        this.syncAndFilter(this.getAdvancedSearchFromStore());
    },

    onDestroy: function () {
        Ext.destroy(this.modal);

        this.callParent(arguments);
    }
});