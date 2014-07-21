/**
 * @class Taco.view.settings.localization.AdvancedSearchLocaleForm
 */
Ext.define('Taco.view.settings.localization.AdvancedSearchLocaleForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        //'Taco.core.ux.form.field.AdminUser',
        //'Taco.store.ChannelPicker'
    ],

    defaults: {
        width: 480,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this,
            data = [{ id: null, name: 'All' }];
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
                    fieldLabel: 'Keyword Search'
                }
            ];

            if (this.advancedSearchConfig && this.advancedSearchConfig.quickFilterData) { //&& this.enableQuickFilters

                this.items.push(
                {
                    xtype: 'combo',
                    margin: '0 0 0 20',
                    itemId: 'quickFilter',
                    queryMode: 'local',
                    typeAhead: false,
                    isSelectField: true,
                    emptyText: 'Quick Filter',
                    store: this.advancedSearchConfig.quickFilterData
                    //  value: this.getQuickFilterFromStore(),
                    //listeners: {
                    //    change: this.onQuickFilterChange,
                    //    beforeselect: this.onBeforeSelect,
                    //    scope: this
                    //}
                });
            }

        this.callParent(arguments);
    }
});