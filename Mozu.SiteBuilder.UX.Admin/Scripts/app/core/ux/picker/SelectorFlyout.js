
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
    alignment: 'tr-br?',
    alignmentOffsets: [0, 0],
    callToActionText: '',
    excludeByValue: '',

    initComponent: function () {

        if (Ext.isArray(this.store)) {
            this.initStoreFromArray();
        }

        this.addEvents([
            'select'
        ]);

        this.buildView();

        this.items = [{
            cls: 'call-to-action',
            hidden: !this.callToActionText,
            html: this.callToActionText,
            xtype: 'component'
        }, this.view];

        this.callParent(arguments);
    },

    adjustHeight: function() {
        this.setHeight(null);
        if (this.getY() + this.getHeight() > window.innerHeight) {
            this.setHeight(window.innerHeight - this.getY());
        }
    },

    show: function (positionNextTo) {
        var el = this.el || this.protoEl;

        this.store.clearFilter(true);
        this.store.filterBy(function (record) {
            return record.get('value') !== this.excludeByValue;
        }, this);

        if (!this.positionNextTo) {
            this.positionNextTo = this.up();
        }

        if (!positionNextTo) {
            positionNextTo = this.positionNextTo;
        }

        this.callParent(arguments);

        this.alignTo(
            positionNextTo.getEl(),
            this.alignment,
            this.alignmentOffsets
        );

        this.adjustHeight();
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