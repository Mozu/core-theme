/**
 * @class Taco.view.site.navigation.Themes
 * @deprecated
 */
Ext.define('Taco.view.site.navigation.Themes', {
    extend: 'Taco.core.ux.BaseGrid',
    requires: ['Taco.model.ThemeListing', 'Taco.store.ThemeListing'],

    layout: {
        type: 'fit',
        align: 'stretch'
    },
    height: 460,
    cls: 'taco-card-flex taco-navigation',


    hideHeaders: true,

    columns: [{
        dataIndex: 'name',
        text: 'Name',
        width: 90,
        flex: 1
    }, {
        dataIndex:'thumbnail',
        text:'thumbnail',
        flex: 1.5,
        renderer : function(value){
            return '<img src="' + value  + '" />';
        }
    }],

    initComponent: function () {
        var me = this;

        // TODO: Add listener logic to handle immediate selection
        this.store = Ext.create('Taco.store.ThemeListing');
        this.mon(
            this.store,
            'load',
            function () {
                var model = this.store.findRecord('selected', true);
                if (model) {
                    Ext.defer(function () {
                        this.getSelectionModel().select([model], false, true);
                    }, 1000, this);
                }
            },
            this
        );

        this.getSelectionModel().store = this.store;

        this.enableBubble('themechange');
        this.addEvents('themechange');

        this.callParent(arguments);

        this.store.load();

        this.on({
            select: function (rowModel, record, index, eOpts) {

                var theme = record;
                theme.set('selected', true);
                theme.save({
                    callback: function () {
                         me.fireEvent('themechange', theme);

                    }
                });
            },
            // hide: function() {
            //     this.getEl().toggleCls('taco-card-flex-active');
            // },
            // show: function() {
            //     this.getEl().toggleCls('taco-card-flex-active');
            // },
            scope: this
        });

    }
});

