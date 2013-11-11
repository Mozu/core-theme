/**
 * @class Taco.view.dashboard.Index
 */

Ext.define('Taco.view.dashboard.Index', {
    extend: 'Taco.core.ux.content.Container',

    initComponent: function () {
        var me = this, dashboard;
        me.renderData = [];
        
        me.navigationStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Navigation');

        this.navigationStore.addListener('load', function () {
            
            Ext.Array.forEach(me.navigationStore.data.items, function (el, index, arr) {
                var pushData = {};
                var subNav = [];
                pushData['label'] = el.get('label');
                pushData['icon'] = el.get('icon');
                pushData['address'] = el.get('address');
                Ext.Array.forEach(el.itemsStore.data.items, function (subEl, index, arr) {
                    var subNavData = {};
                    subNavData['label'] = subEl.get('label');
                    subNavData['address'] = subEl.get('address');
                    subNav.push(subNavData);
                }, this);
                pushData['subNav'] = subNav;
                this.renderData.push(pushData);
            }, this);
            this.dashboardTpl.update(this.renderData);
        }, this);
        
        me.dashboardTpl = Ext.create('Ext.Component', {
            data: me.renderData,
            padding: '0 0 0 50',
            tpl: [
                '<ul class="taco-dashboard-group">',
                    '<tpl for=".">',
                        '<li class="taco-dashboard-item">',
                            '<div class="taco-dashboard-icon">ICON</div>',
                            '<div class= "taco-dashboard-item-header"><a  data-url="{[values.address]}">{[values.label]}</a></div>',
                            '<tpl for="subNav">',
                                '<div class= "taco-dashboard-item-item"><a  data-url="{[values.address]}">{[values.label]}</a></div>',
                            '</tpl>',
                        '</li>',
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
            title: 'Dashboard',
        };
        
        Ext.apply(me.body, {
            layout: 'fit',
            items: me.dashboardTpl
        });

        me.callParent(arguments);
    },

    // combines both options objects
    mergeOptions: function (obj1, obj2) {
        var obj3 = {};

        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }

        return(obj3);
    }
});
