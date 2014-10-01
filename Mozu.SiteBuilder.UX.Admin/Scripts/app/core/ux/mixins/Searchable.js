/**
 * @class Taco.core.ux.mixins.Searchable 
 * Grid Mixin that provides custom search bar and result count
 * add this to the initComponent of your grid to initilize this mixin
  
  // to include this mixin in your class:

        mixins: {
            searchable: 'Taco.core.ux.mixins.Searchable'
        },


  
    < ... code fragment ... >

        initComponent: function (){

            //initialize the grid paging toolbar
            this.mixins.searchable.constructor.apply(this);

            this.callParent(arguments)
        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.Searchable', {
    requires: [
        'Taco.core.ux.form.FilterContainer',
        'Taco.core.util.ExceptionWhiner',
        'Ext.toolbar.Spacer',
        'Taco.core.ux.ComboFilter'
    ],


    constructor: function () {
        this.initSearchable();
    },
    
    initSearchable: function () {
        var me = this;
        
        
        Ext.applyIf(me, {
            searchToolbar: null,
            enableQuickFilters:true,
            hideSearchToolbar: false,
            enableSearch: true
        });

        me.filterFormConf = Ext.clone(me.filterFormConf);

        me.filterProperties = Ext.clone(me.filterProperties);

    },
    
    // meant to be overriden by the subclass;
    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form orders',
        items: [{
            xtype: 'container',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [
                {
                    name: 'name',
                    fieldLabel: 'Name',
                    flex: 1

                }, {
                    name: 'id',
                    fieldLabel: 'Id',
                    flex: 1
                }
            ]
        }]
    },

    // meant to be overriden by the subclass;
    filterProperties: [
        {
            property: 'all',
            text: 'All',
            isDefault: true
        },
        {
            name: 'name',
            text: 'Name'
        },
        {
            name: 'id',
            text: 'Id'
        }
    ],
    
    createSearchToolbar: function () {
        var me = this,
            conf;
        
        if (!me.hideSearchToolbar) {
            
            conf = {
                dock: 'top',
                minHeight:30,
                padding: '0px 0px 10px 0px',
                cls: 'taco-grid-search-toolbar',
                items: [
                    /*
                    {
                        xtype: "tbspacer",
                        flex: 1,
                        hidden: me.enableSearch
                    },
                    {
                        xtype: "tbspacer"
                    }, {
                        xtype: 'tbtext',
                        itemId: 'recordCount',
                        margin: '6 0 6 14',
                        style: "",
                        tpl: new Ext.XTemplate([
                                '<div>',
                                    '<span class="record-total-count">{totalCount}</span> ',
                                    '<span class="record-unit">',
                                    '<tpl if="totalCount == 1">{[Ext.util.Inflector.singularize(values.unit)]}<tpl else>{unit}</tpl>',
                                    '</span>',
                                '</div>'
                        ]),
                        data: {
                            count: 0,
                            totalCount: 0,
                            unit: 'records'
                        }
                    }
                    */
                ]
            };


            if (me.enableSearch) {

                me.searchBox = Ext.widget({
                    xtype: 'taco-filtercontainer',
                    width: '100%',
                    flex: 1,
                    enableQuickFilters : this.enableQuickFilters,
                    quickFilterData: me.advancedSearchConfig.quickFilterData,
                    advancedForm: me.advancedSearchConfig.form,
                    advancedFormCls: me.advancedSearchConfig.advancedFormCls,
                    disableAdvancedSearch: (!me.advancedSearchConfig.disableAdvancedSearch) ? false : true,
                    emptySearchText: (!me.advancedSearchConfig.emptySearchText) ? '' : me.advancedSearchConfig.emptySearchText,
                    store: me.store,
                    filterStores: me.advancedSearchConfig.stores,
                    value: this.options && this.options.query ? this.options.query : undefined
                });

                conf.items.unshift(
                    me.searchBox
                );
            } else {
                
                // need a spacer to force the bar to have the correct height
                conf.items.unshift(
                    {
                        xtype: "tbspacer",
                        height:30
                    }
                );
                
            }

            me.searchToolbar = Ext.widget('toolbar', conf);
            
        }
        

        return me.searchToolbar;
    }
});