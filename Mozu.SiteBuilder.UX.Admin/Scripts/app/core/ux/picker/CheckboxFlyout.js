
Ext.define('Taco.core.ux.picker.CheckboxFlyout', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.checkboxflyout',

    componentCls: Taco.baseCSSPrefix + 'checkbox-flyout',
    floating: true,
    shadow: false,
    hidden: true,
    alignment: 'tc-bc?',
    alignmentOffsets: [0, 0],
    callToActionText: '',

    initComponent: function () {

        if (Ext.isArray(this.store)) {
            this.initStoreFromArray();
        }

        this.addEvents([
            'change'
        ]);

        this.enableBubble([
            'change'
        ]);

        this.items = this.buildItems();

        this.callParent(arguments);

        this.on({
            click: function (e) {
                e.stopPropagation();
            },
            element: 'el'
        });
    },

    show: function (positionNextTo) {
        var el = this.el || this.protoEl;

        if (!this.positionNextTo) {
            this.positionNextTo = this.up();
        }

        if (!positionNextTo) {
            positionNextTo = this.positionNextTo;
        }

        this.callParent(arguments);

        this.alignTo(
            positionNextTo.getEl ? positionNextTo.getEl() : positionNextTo,
            this.alignment,
            this.alignmentOffsets
        );

        this.oldValue = this.getValueString();
    },

    hide: function () {
        var ret = [];

        this.callParent(arguments);

        if (this.oldValue === this.getValueString()) {
            return;
        }

        this.store.each(function (record) {
            if (record.get('selected')) {
                ret += record.get('value') + '-';
            }
        });

        this.fireEvent('change', this, this.getValueArray());
    },

    getValueArray: function () {
        var ret = [];

        this.store.each(function (record) {
            if (record.get('selected')) {
                ret.push(record.get('value'));
            }
        });

        return ret;
    },

    getValueString: function () {
        return this.getValueArray().join(',');
    },

    buildItems: function () {
        var items = [],
            checkboxItems = [];

        items.push({
            cls: 'call-to-action',
            hidden: !this.callToActionText,
            html: this.callToActionText,
            xtype: 'component'
        });

        this.store.each(function (record) {
            items.push({
                boxLabel: record.get('text'),
                checked: record.get('selected'),
                cls: 'checkbox-item',
                inputValue: record.get('value'),
                listeners: {
                    change: function (view, val) {
                        record.set('selected', val);
                    },
                    click: {
                        fn: function (e) {
                            var el = Ext.fly(e.target);

                            if (!el.hasCls('x-form-cb-wrap-inner')) {
                                return;
                            }

                            Ext.getCmp(el.up('table').id).setValue(!record.get('selected'));
                        },
                        element: 'el'
                    },
                    scope: this
                },
                xtype: 'checkboxfield'
            })
        });

        return items;
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