/**
* @author Travis Johnson
* @class Taco.view.option.TempValueEditor
*/


    Ext.define('Taco.view.option.TempValueEditor', {
        extend: 'Ext.container.Container',
        alias: 'widget.tempoptionvalueeditor',
        initComponent: function () {
            var me = this;

            this.items = [{
                xtype: 'dataview',
                cls: 'taco-option-value-view',
                tpl: ['<tpl for=".">', '<div class="taco-option-value-row"><input class="taco-option-value-input" type="text" value="{value}" placeholder="Example: &quot;Medium&quot;" /></div>', '</tpl>'],
                itemSelector: '.taco-option-value-row',
                store: me.store
            }, {
                xtype: 'action',
                text: '+ Add Another Value',
                click: function () {
                    me.addAnotherValue();
                }
            }];

            this.callParent(arguments);

            this.dataView = me.down('dataview');

            this.dataView.on({
                viewready: function () {
                    me.bindCustomEvents();
                }
            });
        },

        bindStore: function (store) {
            var me = this;

            this.store = store;

            this.dataView.bindStore(store);
            console.log('bind store1');

            store.on({
                datachanged: {
                    fn: this.afterDataChanged,
                    scope: this
                },
                update: {
                    fn: this.afterDataChanged,
                    scope: this
                }
            });

            this.bindCustomEvents();
        },

        afterDataChanged: function () {
            this.doLayout();
            this.bindCustomEvents();
        },

        bindCustomEvents: function () {
            var me = this,
                dataViewEl = this.dataView.getEl(),
                rows;


            if (!dataViewEl)
            {
                console.log('no dataview yet!');
                return;
            }
       
            console.log('bind custom events', this.store.count());

            rows = dataViewEl.query('.taco-option-value-row');

            this.store.each(function (record, index) {
                var el = new Ext.dom.Element(rows[index]),
                    input = el.down('input.taco-option-value-input'),
                    fnComplete;

                if (!input)
                {
                    return;
                }

                //console.log('bind record', record, index, input);
                input.addListener('focus', function () {
                    me.focusIndex = index;
                    //console.log('set focus index', index);
                });
                input.addListener('blur', function () {
                    console.log('bluring', input.id);
                    if (record.get('value') === input.getValue())
                    {
                        return;
                    }
                    record.set('value', input.getValue());
                });
                input.addListener('keydown', function (e) {
                    //console.log('keydown', e.keyCode);
                    if (e.keyCode === 13)
                    {
                        e.stopEvent();
                    }
                });

                input.addListener('keyup', function (e) {
                    if (e.keyCode === 13)
                    {
                        e.stopEvent();
                        input.dom.blur();
                        Ext.defer(function () {
                            //me.setFocus(me.focusIndex + 1);
                            if (me.focusIndex === me.store.count() - 1)
                            {
                                me.addAnotherValue();
                            }
                        }, 1);
                    }

                })
            });
        },

        afterRender: function () {
            this.callParent(arguments);

            this.bindCustomEvents();
        },

        setFocus: function (index) {
            var input = this.dataView.getEl().down('.taco-option-value-row:nth-child(' + (index + 1) + ') input');

            if (input)
            {
                console.log('input.focus()');
                input.focus();
                return;
            }
        },

        addAnotherValue: function () {
            var me = this;

            this.store.add({
                value: ''
            });

            Ext.defer(function () {
                me.setFocus(me.store.count() - 1);
            }, 1);
        }
    });
