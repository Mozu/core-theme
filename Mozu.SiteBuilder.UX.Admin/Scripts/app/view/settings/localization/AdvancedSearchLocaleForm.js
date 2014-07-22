/**
 * @class Taco.view.settings.localization.AdvancedSearchLocaleForm
 */
Ext.define('Taco.view.settings.localization.AdvancedSearchLocaleForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.LocalizedAttributes',
        'Taco.core.ux.ComboFilter',
        'Ext.ux.form.field.BoxSelect'
        //'Taco.core.ux.form.field.AdminUser',
        //'Taco.store.ChannelPicker'
    ],

    defaults: {
        width: 480,
        xtype: 'textfield'
    },
    initComponent: function () {
        var quickFilterData = Taco.view.settings.localization.util.Locales.getAdvancedSearchFilterData();
        //var me = this,
        //    data = [{ id: null, name: 'All' }];
            //,
            //sites;
        
        //Ext.each(Taco.app.context.masterCatalogs, function (mc) {
        //    Ext.Array.push(data,mc.sites);
        //});

        //sites = Ext.create('Ext.data.Store', {
        //        fields: ['id', 'name'],
        //        data: data
        //    }),
            this.items = [
                {
                    name: 'keyword',
                    fieldLabel: 'Keyword Search',
                    width: 450
                },
                //{
                //    xtype: 'taco.combofilter',
                //    name: 'quickFilter',
                //    fieldLabel: 'Quick Filter',
                //    width: 200,
                //    //margin: '0 0 0 20',
                //    //valueField: 'id',
                //    //displayField: '',
                //    itemId: 'quickFilter',
                //    queryMode: 'remote',
                //    typeAhead: false,
                //    isSelectField: true,
                //    emptyText: 'Quick Filter',

                //    store: new Ext.data.ArrayStore({
                //        id: 0,
                //        fields: [
                //            'myId',  // numeric value is the key
                //            'displayText'
                //        ],
                //        data: quickFilterData
                //    }),
                //    valueField: 'myId',
                //    displayField: 'displayText',
                //    triggerAction: 'all'

                    
                //    //  value: this.getQuickFilterFromStore(),
                //    //listeners: {
                //    //    change: this.onQuickFilterChange,
                //    //    beforeselect: this.onBeforeSelect,
                //    //    scope: this
                //    //}
                //},
                {
                    xtype: 'combobox',
                    name: 'productUsage',
                    fieldLabel: 'Product Usage',
                    width: 200,
                    valueField: 'id',
                    displayField: 'name',
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: true,
                    forceSelection: true,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', "name"],
                        data: [
                            {
                                name: "Standard Product",
                                id: "Standard"
                            }, {
                                name: "Configurable Product With Options",
                                id: "Configurable"
                            }, {
                                name: "Product Bundle",
                                id: "Bundle"
                            }, {
                                name: "Bundle Component",
                                id: "Component"
                            }
                        ]
                    })
                },{
                    xtype: 'combobox',
                    name: 'filterLocales',
                    fieldLabel: 'Filter',
                    width: 200,
                    valueField: 'id',
                    displayField: 'name',
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: true,
                    forceSelection: true,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', 'name'],
                        data: quickFilterData
                    })
                }

            ];

            //if (Taco.view.settings.localization.util.Locales.getQuickFilterData()) {

            //    this.items.push(
            //    {
            //        xtype: 'combo',
            //        margin: '0 0 0 20',
            //        itemId: 'quickFilter',
            //        queryMode: 'local',
            //        typeAhead: false,
            //        isSelectField: true,
            //        emptyText: 'Quick Filter',
            //        store: Taco.view.settings.localization.util.Locales.getQuickFilterData()
            //        //  value: this.getQuickFilterFromStore(),
            //        //listeners: {
            //        //    change: this.onQuickFilterChange,
            //        //    beforeselect: this.onBeforeSelect,
            //        //    scope: this
            //        //}
            //    });
            //}

        this.callParent(arguments);
    }
});