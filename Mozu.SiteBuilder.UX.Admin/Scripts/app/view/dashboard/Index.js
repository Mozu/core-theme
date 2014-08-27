/**
 * @class Taco.view.dashboard.Index
 */

Ext.define('Taco.view.dashboard.Index', {
    extend: 'Taco.core.ux.content.Container',

    initComponent: function () {
        var me = this, dashboard;
        me.renderData = [];
        
       
        me.dashboardTpl = Ext.create('Ext.Component', {
            data: me.renderData,
            padding: '0 0 0 50',
            tpl: [
                '<ul class="taco-dashboard-group">',
                    '<tpl for=".">',
                        '<li class="taco-dashboard-item">',
                            '<a data-url="{[values.address]}" class="taco-dashboard-icon taco-icon-{[values.id]}"></a>',
                            '<div class= "taco-dashboard-item-header"><a data-url="{[values.address]}">{[values.label]}</a></div>',
                            '<div class= "taco-dashboard-item-item"><tpl for="subNav">',
                                '<a data-url="{[values.address]}">{[values.label]}</a>',
                            '</tpl></div>',
                        '</li>',
                        '{[xindex % 4 === 0 && xindex !== xcount ? "</ul><ul class=\'taco-dashboard-group\'>" : ""]}',
                    '</tpl>',
                '</ul>'
            ],
            listeners: {
                click: {
                    element: 'el',
                    delegate: '[data-url]',
                    fn: function (event, node) {
                        event.stopEvent();
                        Taco.core.StateManager.attemptNavigate(node.dataset.url);
                    }
                }
            }
        });
       
        me.header = {
            hidden: true
        };
        
        Ext.apply(me.body, {
            layout: 'fit',
            items: me.dashboardTpl
        });

        me.callParent(arguments);
        
        me.navigationStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Navigation');

        
        if (this.navigationStore.hasCompletedLoading()) {
            this.renderNav();
        } else {
            this.navigationStore.addListener('load', this.renderNav, this);
        }
        
    },

    // combines both options objects
    mergeOptions: function (obj1, obj2) {
        var obj3 = {};

        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }

        return(obj3);
    },
    renderNav:function () {
        var me = this;
        Ext.Array.forEach(me.navigationStore.data.items, function (el, index, arr) {
            var pushData = {};
            var subNav = [];
            pushData['id'] = el.get('id');
            pushData['label'] = el.get('label');
            pushData['icon'] = el.get('icon');
            pushData['address'] = el.get('address');
            Ext.Array.forEach(el.itemsStore.data.items, function (subEl, index, arr) {
                var subNavData = {};
                subNavData['label'] = subEl.get('label');
                subNavData['address'] = subEl.get('address');
                if (subEl.get('visible') && !subEl.get('breadCrumbOnly')) {
                    subNav.push(subNavData);
                }
            }, this);
            pushData['subNav'] = subNav;
            if (el.get('visible')) {
                this.renderData.push(pushData);
            }

        }, this);
        this.dashboardTpl.update(this.renderData);
    }
});
