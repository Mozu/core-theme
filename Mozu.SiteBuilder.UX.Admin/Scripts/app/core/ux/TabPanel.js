/**
 * @class Taco.core.ux.TabPanel
 */

    Ext.define('Taco.core.ux.TabPanel', {
        extend: 'Ext.container.Container',
        alias: 'widget.tacotabpanel',
        activeAction: null,
        cls: 'taco-tabs',

        initComponent: function () {
            var me = this,
                tabPanelItems = [],
                tabActionItems = [];

            Ext.each(me.items, function (item, index) {
                var action = Ext.create('Taco.core.ux.action.Action', {
                    text: item.title,
                    tpl: item.titleTpl,
                    data:item.titleData
                });

                action.on('click', me.activateItem, me, { index: index });

                tabActionItems.push(action);
                tabPanelItems.push(item);
            });

            me.actionsContainer = Ext.create('Ext.container.Container', {
                cls: 'taco-tab-actions',
                items: tabActionItems
            });

            me.itemsContainer = Ext.create('Ext.container.Container', {
                cls: 'taco-tab-panels',
                layout: {
                    type: 'card',
                    align: 'stretch'
                },
                defaults: {
                    xtype: 'container',
                    flex: 1
                },
                flex: 1,
                activeItem: me.activeIndex || 0,
                items: tabPanelItems
            });

            me.items = [me.actionsContainer, me.itemsContainer];
            
            if (tabActionItems.length < 2) {
                me.actionsContainer.hide();
            }

            me.tabActionItems = tabActionItems;

            me.callParent(arguments);
        },

        addToTab: function (tabIndex, item) {
            this.itemsContainer.items.get(tabIndex).add(item);
        },

        highlightTab: function (index) {
            var me = this, action;

            action = me.actionsContainer.items.get(index);

            if (me.activeAction)
            {
                // unhighlight current tab
                //me.activeAction.arrowEl.removeCls('taco-tab-active');
                me.activeAction.el.removeCls('taco-tab-active');
            }

            // highlight new tab
            //action.arrowEl.addCls('taco-tab-active');
            action.el.addCls('taco-tab-active');

            me.activeAction = action;
        },

        afterLayout: function () {
            var me = this;

            me.callParent(arguments);

            // Ext.each(me.tabActionItems, function (action) {
                // if (!action.arrowEl)
                // {
                    // action.arrowEl = Ext.DomHelper.insertAfter(action.el, '<div class="taco-tab-arrow"></div>', true);
                // }
                // action.arrowEl.alignTo(action.el, 't-b', [0, -3]);
            // });

            if (!me.activeAction)
            {
                me.highlightTab(this.activeIndex || 0);
            }

        },

        

        activateItem: function (action,options) {
            var action,
        		me = this,
                index = options.index;
            
            if (typeof index !== "number")
            {
                
                return Ext.Error.raise('You must supply a tab index to activate a tab.');
            }

            me.highlightTab(index);

            me.itemsContainer.getLayout().setActiveItem(index);

            me.activeIndex = index;
            me.fireEvent('tabchange');
        }

    });