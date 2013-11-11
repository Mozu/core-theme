/**
 * @class Taco.core.ux.mixins.Searchable 
 * Grid Mixin that provides custom search bar and result count
 * add this to the initComponent of your grid to initilize this mixin
  
  // to include this mixin in your class:

        mixins: {
            searchable: 'Taco.core.ux.mixins.Pageable'
        },


  
    < ... code fragment ... >

        initComponent: function (){

            //initialize the grid paging toolbar
            this.mixins.searchable.constructor.apply(this, arguments);

            this.callParent(arguments)
        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.Searchable', {
    
    requires: [
        'Taco.core.util.ExceptionWhiner',
        'Ext.toolbar.Spacer',
        'Taco.core.ux.ComboFilter'
    ],

    constructor: function () {
        this.initSearchable();
    },
    
    initSearchable: function () {
        var me = this;

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

        conf = {
            dock: 'top',
            items: [
                {
                    xtype: "tbspacer"
                }, {
                    xtype: 'tbtext',
                    itemId: 'recordCount',
                    margin: '6 0 6 14',
                    style:"",
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
            ]
        };
        
        me.searchBox = Ext.widget({
            xtype: 'taco.combofilter',
            flex: 1,
            hidden:!me.enableSearch,
            itemStore: me.store,
            filterForm: me.filterFormConf,
            filterProperties: me.filterProperties
        });


        //todo: need to figure out where this is set and why;
        if (this.options && this.options.query) {
            me.on('afterrender', function () {
                me.searchBox.setValue([this.options.query]);
            });
        }
        
        conf.items.unshift(
            {
                xtype: "tbspacer",
                flex: 1,
                hidden: me.enableSearch
            },
            me.searchBox
        );

        me.searchToolbar = Ext.widget('toolbar', conf);

        return me.searchToolbar;
    }
});