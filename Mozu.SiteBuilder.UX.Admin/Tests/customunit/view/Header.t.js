StartTest(function(t) {
    var m = {};

    t.chain(
        function (next) {
            var async = t.beginAsync();
            t.it('Should have requireable files', function(t){
                t.requireOk('Taco.view.navigation.PrimaryMenu', next.bind(this, async));
            });
        },
        function(next, async){
            t.endAsync(async);
            var me = this,
                primaryMenuTrigger = Ext.create('Taco.core.ux.action.Action', {
                    xtype: 'action',
                    id: 'primaryMenuTrigger',
                    text: '',
                    width: 60,
                    height: 40,
                    cls: Taco.baseCSSPrefix + 'primary-menu-trigger',
                    alias: 'taco-menu-trigger',
                    click: function () {
                        if (me.primaryMenu.isHidden() || !me.primaryMenu.rendered) {
                            me.primaryMenu.showMenu();
                        } else {
                            me.primaryMenu.hideMenu();
                        }
                    }
                }),
                menuTrigger = Ext.dom.Query.select('.' + Taco.baseCSSPrefix + 'primary-menu-trigger'),
                primaryMenu = Ext.getCmp('primaryMenu');

            t.it('should load the menu trigger', function(t){
                t.ok(menuTrigger);
            });

            t.it('menu should be hidden to start', function(t) {
                t.isComponentNotVisible(primaryMenu, 'The primary menu is hidden');
            });
            
            t.it('should be visible when you click the trigger', function(t){
                primaryMenu.trigger.click();
                t.isComponentVisible(primaryMenu, 'The primary menu is visible when clicked');
            });

            t.it('should be rehid if you click again', function(t){
                primaryMenu.trigger.click();
                t.isComponentNotVisible(primaryMenu, 'The primary menu is rehidden');
            });

            t.it('should load its associated store', function(t)  {
                t.ok(primaryMenu.getStore());
            });

        });
});