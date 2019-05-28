Ext.define('Taco.view.website.misc.VariationsDropdown', {
    extend: 'Ext.button.Button',
    alias: 'widget.taco-variationsdropdown',
    ui: 'link',
    cls: 'taco-action-secondary taco-variations-dropdown',
    scale: 'medium',
    text: 'Variations',
    height: 40,
    menuAlign: 'tr-br',
    initComponent: function () {
        var me = this;
        this.menu = Ext.create('Ext.menu.Menu', {
            width: 150,
            cls: 'taco-variations-dropdown-menu',
            items: [{
                text: 'Manage Variations',
                handler: me.managePageVariations,
            }]
        });
        this.variationStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityVariations');
        this.variationStore.on({
            datachanged: function (node) {
                me.updateVariations()
            }
        })

        this.callParent(arguments);
    },
    updateVariations: function () {
        var me = this;
        var items = [];



        if (this.variationStore.count()) {
            items = [
                {
                    text: 'Base Page',
                    handler: me.changePageVariation.bind(me, 'base')
                }
            ];
            var taggedVariation = this.variationStore.getActiveVariation() || "";
            var taggedVariationId = "";

            if (taggedVariation) {
                taggedVariationId = taggedVariation.get('id');
            }

            this.variationStore.each(function (variation) {
                items.push({
                    text: ' - ' + variation.get('name'),
                    handler: me.changePageVariation.bind(me, variation.get('id')),
                    componentCls: (taggedVariationId === variation.get('id')) ? 'taco-variations-dropdown-item-selected' : ''
                });
            });

        }
        items.push({
            text: 'Manage Variations',
            handler: me.managePageVariations,
            componentCls: 'taco-variations-dropdown-item-manage'
        });
        this.menu = Ext.create('Ext.menu.Menu', {
            width: 150,
            cls: 'taco-variations-dropdown-menu',
            items: items
        });

        this.setDisabled(false);
        this.updateLayout();
    }
});