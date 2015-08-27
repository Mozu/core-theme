/**
 * @class Taco.shared.view.field.LocationPickerField
 */
Ext.define('Taco.shared.view.field.LocationPickerField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.taco-locationpickerfield',
    requires: [

    ],

    config: {

    },

    cls : "taco-locationpickerfield",

    autoSelectFirstRecord: true,

    //itemsPerPage: 30,
    displayField: 'name',
    hideLabel: true,
    hideTrigger: false,
    emptyText: "Search",
    selectOnFocus: false,
    matchFieldWidth : false,
    extraFilters: null,
    // note: cant set flex in the base class as it messes up the width when used in as an editor by rowEditor. flex must be set by the instance if needed;
    //flex: 1,
    listConfig: {
        cls: "location-picker-menu",
       maxWidth:"400",
        // Custom rendering template for each item
       getInnerTpl: function () {
            return "<span class='name'>{name}</span> <span class='code'>{displayCode}</span>";
        },

        // this is an override that hides the paging toolbar when the list only contains a single page of results;
        refresh: function () {
            var me = this,
                toolbar = me.pagingToolbar;

            Ext.view.View.prototype.refresh.call(me);
            if (me.rendered && toolbar && toolbar.rendered && !me.preserveScrollOnRefresh) {
                me.el.appendChild(toolbar.el);
                if (me.getStore().getTotalCount() <= me.pageSize) me.el.last().hide();
                else me.el.last().show();
            }
        }
    },
    
    pageSize: 10,
    
    enableKeyboardPaging:true,

    initComponent: function(eOpts) {
        var me = this;
        

        if (!me.store) {

            me.store = Taco.core.data.StoreManager.getOrCreate({
                createOnly: true,
                type: 'Taco.store.Locations',
                pageSize: me.pageSize,
                // note that clearSort is required to avoid having the sorters get cleared when the store is instantiated;
                clearSort: false,
                remoteSort: true,
                remoteFilter: true,
                sorters: [{
                    property: 'name',
                    direction: 'ASC'
                }],
                filters: [{
                    property: 'supportsInventory',
                    value: true
                }],
                autoLoad: true,
                listeners: {
                    beforeload: function (store, operation) {
                        var proxy = store.getProxy();
                        if (proxy.extraParams) {
                            //reset params at proxy (e.g. advSearch)
                            proxy.extraParams = {};
                        }
                        if (this.extraFilters) {
                            store.extraFilters.add(this.extraFilters);
                        }
                    },
                    scope: this
                }
            });

        }

        if (me.autoSelectFirstRecord) {
            me.mon(me.store,'load', function () {                
                me.selectFirstRecord();
            }, me, {
                single: true
            });
        }

        me.callParent(arguments);
    },

    selectFirstRecord: function () {
        var me = this;
        var recordSelected = me.getStore().getAt(0);
        if (recordSelected) {
            me.select(recordSelected);
            // need to manually fire the select event; manually calling select method on combo doesn't fire the event;
            this.fireEvent('select', me, [recordSelected]);
        }
    }
});
