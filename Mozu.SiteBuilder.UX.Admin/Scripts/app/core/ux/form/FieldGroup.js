/**
* @class Taco.core.ux.form.FieldGroup
* @author James Zetlen
* A section pane on an editor, that expands to show the full controls and collapses to show a summary view.
*/

    Ext.define('Taco.core.ux.form.FieldGroup', {
        extend: 'Ext.container.Container',
        requires: ['Taco.core.ux.action.Action', 'Taco.core.ux.BoxReorderer'],
        width: 580,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },

        autoEl: 'section',
        margin: '20 0',

        cls: Taco.baseCSSPrefix + 'fieldgroup-container',

        expand: function () {
            var me = this;
            if (me.body.items.getCount() == 0 || !me.body.items.get(0).el) {
                return;
            }
            me.body.animate({
                to: { height: me.body.items.get(0).getHeight() },
                listeners: {
                    afteranimate: function () {
                        me.isOpen = true;
                        me.setShow(false);
                    }
                }
            });
        },

        contract: function () {
            var me = this;
            me.body.animate({
                to: { height: 0 },
                listeners: {
                    afteranimate: function () {
                        me.isOpen = false;
                        me.setShow(true);
                    }
                }
            });
        },


        setShow: function (show) {
            this.showAction.setVisible(show);
            this.hideAction.setVisible(!show);
        },

        initComponent: function () {
            var me = this;

            me.header = Ext.create('Ext.container.Container', {
                layout: { type: 'hbox', align: 'top' },
                cls: me.cls + '-header',
                height: 40,
                items: [
                {
                    xtype: 'component',
                    autoEl: 'strong',
                    tpl: me.title + ' ({count})',
                    data: { count: 0 },
                    flex: 1,
                    updateCount: function (to) {
                        this.update({ count: to });
                    }
                }]
                // actions will be pushed on to this items array
            });

            me.body = Ext.create('Ext.container.Container', {
                cls: me.cls + '-body',
                plugins: Ext.create('Taco.core.ux.BoxReorderer', {}),
                defaults: {
                    reorderable: false
                },
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                }
            });
            me.footer = Ext.create('Ext.container.Container', {
                cls: me.cls + '-footer',
                items: me.footeritems,
                layout: {
                    type: 'hbox',
                    pack: 'end',
                    padding: '20 0 0'
                }
            });

            me.showAction = Ext.create('Taco.core.ux.action.Action', {
                text: 'Show Details',
                width: 200,
                style: {
                    textAlign: 'right'
                },
                click: function () {
                    me.expand();
                }
            });

            me.hideAction = Ext.create('Taco.core.ux.action.Action', {
                text: 'Hide Details',
                width: 200,
                style: {
                    textAlign: 'right'
                },
                click: function () {
                    me.contract();
                }
            });

            me.items = [me.header, me.body, me.footer];

            me.callParent(arguments);
            me.body.plugins[0].on({
                ChangeIndex: me.onChangeIndex,
                scope: me
            });

            //   me.header.add(me.showAction);
            //    me.header.add(me.hideAction);
            if (!me.isOpen) {
                me.setShow(true);
            } else {
                me.setShow(false);
            }

        },

        onChangeIndex: function (reorderer, container, dragCmp, startIdx, idx, eOpts) {
            var me = this,
                items = reorderer.container.items,
                orig = items.getAt(startIdx).data,
                dest = items.getAt(idx).data,
                origSeq = orig.get('sequence'),
                destSeq = dest.get('sequence');

            orig.set('sequence', destSeq);
            dest.set('sequence', origSeq);
        }
    });
