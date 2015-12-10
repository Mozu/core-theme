Ext.define('Taco.core.ux.picker.InlineSelector', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.inlineselector',

    cls: 'taco-inline-selector',

    highlighted: false,

    value: null,

    tagText: '',

    labelText: '',

    requires: [
        'Taco.core.ux.picker.Selector',
        'Taco.core.ux.picker.CheckboxFlyout'
    ],

    isInline: true,

    initComponent: function () {

        if (Ext.isArray(this.store)) {
            this.store = this.initStoreFromArray();
        }

        if (Ext.isArray(this.triggerData)) {
            this.triggerStore = this.initStoreFromArray(this.triggerData, this.triggerSelected);
        }

        this.addEvents([
            'select'
        ]);

        if (this.highlighted) {
            this.cls += ' highlight';
        }

        this.items = [{
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                hidden: this.isInline,
                itemId: 'selectorcontainer',
                items: this.buildDropdownItems(),
                xtype: 'container'
            }, {
                cls: 'inline-view',
                hidden: !this.isInline,
                itemId: 'list',
                items: this.buildInlineItems(),
                xtype: 'container'
            }
        ];

        if (this.triggerStore) {
            this.items.push({
                alignmentOffsets: [0, 14],
                callToActionText: this.triggerCallToActionText,
                itemId: 'checkboxflyout',
                store: this.triggerStore,
                xtype: 'taco.checkboxflyout'
            });
        }

        this.callParent(arguments);

        this.listView = this.down('#list');
        this.selectorView = this.down('#selector');
        this.trigger = this.down('#trigger');
        this.selectorContainer = this.down('#selectorcontainer');
        this.flyout = this.down('#checkboxflyout');

        this.buffer = 0;
        this.on({
            boxready: this.handleBoxReady,
            afterlayout: this.handleAfterLayout,
            scope: this
        });
    },

    handleBoxReady: function () {
        if (!this.flyout) {
            return;
        }

        this.flyout.on({
            select: function (view, record) {
                //this
            },
            scope: this
        });

        this.mon(Ext.getBody(), 'click', function (e) {
            if (e.target.className.indexOf('trigger') > -1) {
                return;
            }

            if (!this.flyout.isHidden()) {
                this.flyout.hide();
            }
        }, this);
    },

    handleAfterLayout: function () {
        var listHeight = this.listView.getHeight();

        if (listHeight === 0) {
            if (Date.now() - this.buffer < 500) {
                return;
            }

            return this.switchToInline();
        }

        if (this.listView.getHeight() > 40) {
            this.buffer = Date.now();
            return this.switchToSelector();
        }
    },

    switchToSelector: function () {
        this.listView.hide();
        this.selectorContainer.show();
    },

    switchToInline: function () {
        this.selectorContainer.hide();
        this.listView.show();
    },

    buildDropdownItems: function () {
        var items = [];

        items.push({
            callToActionText: this.callToActionText,
            defaultText: this.labelText,
            highlighted: this.highlighted,
            itemId: 'selector',
            listeners: {
                select: function (view, record) {
                    this.handleSelect(record);
                },
                scope: this
            },
            store: this.store,
            tagText: this.tagText,
            value: this.value,
            xtype: 'taco.pickerselector'
        });

        if (this.triggerData) {
            items.push({
                cls: 'inline-trigger',
                listeners: {
                    click: this.handleTrigger,
                    element: 'el',
                    scope: this
                },
                xtype: 'component'
            });
        }

        return items;
    },

    buildInlineItems: function () {
        var items = [];

        items.push({
            cls: 'inline-label',
            hidden: !this.labelText,
            html: Ext.String.htmlEncode(this.labelText),
            xtype: 'component'
        });

        this.store.each(function (record) {
            var cls = 'taco-inline-selector-item selector';

            if (record.get('value') === this.value) {
                cls += ' selected';
            }

            if (record.get('showDot')) {
                cls += ' show-dot';
            }

            items.push({
                cls: cls,
                html: Ext.String.htmlEncode(record.get('text')),
                listeners: {
                    click: function () {
                        this.handleSelect(record);
                    },
                    element: 'el',
                    scope: this
                },
                type: 'item',
                xtype: 'component'
            });
        }, this);

        if (this.triggerData) {
            items.push({
                cls: 'inline-trigger',
                listeners: {
                    click: this.handleTrigger,
                    element: 'el',
                    scope: this
                },
                xtype: 'component'
            });
        }

        return items;
    },

    handleTrigger: function (e) {
        if (!this.flyout) {
            return;
        }

        this.flyout[this.flyout.isHidden() ? 'show' : 'hide'](Ext.fly(e.target));
    },

    handleSelect: function (record) {
        if (this.highlighted && record.get('value') === this.selected) {
            return;
        }

        this.highlight();

        Ext.each(this.getEl().query('.selected'), function (dom) {
            Ext.fly(dom).removeCls('selected')
        });

        this.value = record.get('value');

        var index = this.store.findExact('value', this.value);

        Ext.fly(this.listView.getEl().query('.selector')[index]).addCls('selected');

        this.selectorView.selectValue(this.value);

        this.fireEvent('select', this, record);
    },

    initStoreFromArray: function (arr, selectedArr) {
        var store = Ext.create('Ext.data.Store', {
                fields: ['value', 'text', 'showDot', 'selected']
            });

        if (!arr) {
            arr = this.store;
        }

        if (!selectedArr) {
            selectedArr = [];
        }

        Ext.each(arr, function (val) {
            store.add({
                value: val[0],
                text: val[1],
                showDot: val[2],
                selected: Ext.Array.some(selectedArr, function (item) {
                    return item[0] === val[0];
                })
            });
        });

        return store;
    },

    highlight: function (val) {
        var el = this.getEl();

        this.selectorView.highlight(val);

        if (!el) {
            return;
        }

        el[val === false ? 'removeCls' : 'addCls']('highlight');
    }
});