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
    }
});