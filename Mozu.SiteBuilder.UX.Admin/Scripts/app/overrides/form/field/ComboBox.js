/*
 Override of Ext.form.field.ComboBox
*/

Ext.define('Taco.overrides.form.field.ComboBox', {
    override: 'Ext.form.field.ComboBox',
    initComponent: function () {
        var me = this;
        this.callParent(arguments);

        /*
        * combo enhanclement to add keyboard support for paging the remote combo store;
        * need to enable the keyEvents handling on combobox in order to listen for pageup and pagedown button press;        
        */         
        if (me.enableKeyboardPaging) {
            me.enableKeyEvents = true;
            me.mon(me, 'keydown', me.onKeyPaging, me);
        }


        if (!me.listConfig) {
            me.listConfig = {};
        }

        /*
        * combo enhanclement to hide paging toolbar when the result set is less than a single page;
        */
        if (me.autoHidePagingToolbar) {
            

            // this is an override that hides the paging toolbar when the list only contains a single page of results;
            me.listConfig.refresh = function () {
                var me = this,
                    toolbar = me.pagingToolbar;
            
                Ext.view.View.prototype.refresh.call(me);
                if (me.rendered && toolbar && toolbar.rendered && !me.preserveScrollOnRefresh) {
                    me.el.appendChild(toolbar.el);
                    if (me.getStore().getTotalCount() <= me.getStore().pageSize) me.el.last().hide();
                    else me.el.last().show();
                }
            }
        }
    },

    /*
    * Override adds support to the extra triggers so that they can be navigated to via keyboard and triggered via the enter key and spacebar when the trigger has focus;    
    */
    initTrigger: function () {
        var me = this,
            triggerWrap = me.triggerWrap,
            triggerEl = me.triggerEl,
            len = triggerEl.getCount();

        me.callParent(arguments);

        // add a tabIndex to triggers except the first one; the first one is assumed to be handled by the field;
        if (len) {
            // need to also listen for enter key and space bar on the extra triggers
            me.mon(triggerWrap, {
                keydown: function (e) {
                    var me = this;
                    if (e.getKey() == e.ENTER || e.getKey() == e.SPACE) {
                        me.onTriggerWrapClick(e)
                    }
                },
                scope: me
            });


            //check for triggerConfig
            triggerEl.each(function (element, origEl, index) {
                if (index > 0) {
                    
                    var configName = "trigger" + (index + 1)  + "Config"; 
                    var triggerXConfig = me[configName];
                    var isEnabled = true;

                    if (triggerXConfig && triggerXConfig.disabled) {
                        element.addCls("x-form-trigger-disabled");
                        isEnabled = false;
                    }
                    
                    if(isEnabled){
                        element.el.set({
                            tabIndex: 0
                        })
                    }
                    

                }
            })
        }
    },

    enableExtraTrigger : function (index){
        var me = this,
            triggerWrap = me.triggerWrap,
            triggerEl = me.triggerEl
        
        if (triggerEl && triggerEl[index]) {
            triggerEl[index].enable()
        }
    },

    disableExtraTrigger : function  (index){
        var me = this,
            triggerWrap = me.triggerWrap,
            triggerEl = me.triggerEl
        
        if (triggerEl && triggerEl[index]) {
            triggerEl[index].disable()
        }
    },

    /*
    * combo enhanclement to hide paging toolbar when the result set is less than a single page;
    * hides the paging toolbar when there is a single page or less of results;
    */
    autoHidePagingToolbar: false,


    /*
    * combo enhanclement to add keyboard support for paging the remote combo store;
    * turns on an enhancment to paged comboboxes; that allows user to hit pageup and pagedown keyboard buttons to navigate the combos' paged store
    */
    enableKeyboardPaging: false,

    /*
    * combo enhanclement to add keyboard support for paging the remote combo store;
    * called when the user clicks the pageup and pagedown keys while a paged combo has its picker deployed;
    */
    onKeyPaging: function (field, e, t) {
        var me = this,
            key = e.getKey();

        if (me.picker && me.picker.rendered && me.picker.isVisible() && me.picker.pagingToolbar) {
            if (e.PAGE_UP == key) {
                me.picker.pagingToolbar.movePrevious();
                // cancel the event to prevent the keypress from scrolling the page that the combo is on;
                e.stopEvent()
            } else if (e.PAGE_DOWN == key) {
                me.picker.pagingToolbar.moveNext()
                // cancel the event to prevent the keypress from scrolling the page that the combo is on;
                e.stopEvent()
            }
        }
    },

    /*
    * Gets array of selected combobox records and extracts the record.data.
    * Used when the persisted data structure is an array of objects instead of an array of id's
    *
    * returns array of record data objects
    */
    getValueRecordsData: function () {
        var records = this.getValueRecords();
        var data = [];
        Ext.Array.each(records, function (record) {            
            data.push(record.data);
        });        
        return data;
    },

    /**
    * override of the extjs initValue method to add support for autoFetching of the display value when using a remote store;
    * Initializes the field's value based on the initial config.
    */
    initValue: function () {
        var me = this;

        me.value = me.transformOriginalValue(me.value);
        /**
         * @property {Object} originalValue
         * The original value of the field as configured in the {@link #value} configuration, or as loaded by the last
         * form load operation if the form's {@link Ext.form.Basic#trackResetOnLoad trackResetOnLoad} setting is `true`.
         */
        me.originalValue = me.lastValue = me.value;        

        // Set the initial value - prevent validation on initial set
        me.suspendCheckChange++;

        
        // *******************  begin override code ***************** // 
        // for remote stores there is a potential to have the selected value not return on the first page of the store results. this leaves the field without the record to generate the display value.
        // if the store is 'remote' and the field has a value and this feature is enabled then fetch the values explicitly. otherwise do the default behavior for combo box. 
        if (me.autoFetchDisplayValue) {
            var value = Ext.Array.from(me.value, true);
            if (me.queryMode == "remote" && value.length) {
                me.fetchDisplayValue();
            }
        } else {
            me.setValue(me.value);
        }
        // *******************  end override code ***************** // 
        
        me.suspendCheckChange--;
    },
 
    setValue : function(value, doSelect) {
        this.callParent(arguments);
        if (this.autoFetchDisplayValue) {
            if (this.lastSelection && this.lastSelection.length) {
                debugger;
            }
        }
    },

    // override config parameter that enables fetching of display value for combo with remote store;
    autoFetchDisplayValue:false,

    // call service and get the display values without loding the attached store.
    // this allows a remote combo to output a display value when the fields value does not show up in the first page of the store load results. 
    fetchDisplayValue: function () {
        var me = this,
            url = this.store.proxy.api.read,
            params = {},
            value = Ext.Array.from(me.value, true),
            modelName = me.store.model.$className;;        

        // check for empty value;
        if (Ext.isEmpty(me.value)) {
            return;
        }

        Taco.app.getModel(modelName).load(value, {
            success: function (record) {
                if (record) {
                    me.displayTplData = [record.data];
                    me.lastSelection = [record];
                    me.setRawValue(me.getDisplayValue());
                }
            },
            failure: function () {
                console.log("combo: " + me.name + " did not find a matching record to set a display value")
            },
            scope: this
        });
    },

    /**
     * Override provides support for paged remote stores. the original method wouldn't return the current value when the paged store did not contain the selected value. this would cause the field to get cleared;
     * Finds the record by searching for a specific field/value combination.
     * @param {String} field The name of the field to test.
     * @param {Object} value The value to match the field against.
     * @return {Ext.data.Model} The matched record or false.
     */
    findRecord: function (field, value) {
        var me = this,
            ds = this.store,
            idx = ds.findExact(field, value);


        // ****** BEGIN Override  ******  //
        // if the value is the same as the last selection return the cached value.
        // this will allow the store to page since the current selected record may or may not be in the new page of results in ths store
        if (me.autoFetchDisplayValue && me.queryMode == "remote" && value.length && me.lastSelection && me.lastSelection[0] && me.lastSelection[0].get(me.valueField) == value) {
            return me.lastSelection[0]
        }
        // ****** End Override  ******  //


        return idx !== -1 ? ds.getAt(idx) : false;
    }
});