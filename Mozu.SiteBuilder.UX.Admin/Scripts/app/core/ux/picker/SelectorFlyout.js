
Ext.define('Taco.core.ux.picker.SelectorFlyout', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.selectorflyout',

    requires: [
        'Ext.view.View'
    ],
    componentCls: Taco.baseCSSPrefix + 'selector-flyout',
    floating: true,
    shadow: false,
    hidden: true,
    alignment: 'tl-bl?',
    alignmentOffsets: [-1, -1],

    initComponent: function () {

        if (Ext.isArray(this.store)) {
            this.initStoreFromArray();
        }

        this.addEvents([
            'select'
        ]);

        this.buildView();

        this.items = [this.view];

        this.callParent(arguments);
    },

    show: function () {
        var el = this.el || this.protoEl;

        this.callParent(arguments);

        if (!this.positionNextTo) {
            this.positionNextTo = this.up();
        }

        this.alignTo(
            this.positionNextTo.getEl(),
            this.alignment,
            this.alignmentOffsets
        );
    },

    buildView: function () {
        var tpl = new Ext.XTemplate(
                '<ul>',
                    '<tpl for=".">',
                        '<li class="selector">',
                            '{text}',
                        '</li>',
                    '</tpl>',
                '</ul>'
            );

        this.view = Ext.create('Ext.view.View', {
            itemSelector: 'li.selector',
            listeners: {
                select: function (view, record) {
                    Ext.defer(function () {
                        this.fireEvent('select', this, record);
                    }, 5, this);
                },
                scope: this
            },
            tpl: tpl,
            store: this.store,
        });
    },

    initStoreFromArray: function () {
        var store = Ext.create('Ext.data.Store', {
            fields: ['value', 'text']
        });

        Ext.each(this.store, function (val) {
            store.add({
                value: val[0],
                text: val[1]
            });
        });

        this.store = store;
    },
});