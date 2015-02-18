StartTest(function(t) {
    var m = {};

    t.chain(

        function (next) {
            t.it('Should have requireable files', function(t){
                t.requireOk('Taco.view.navigation.PrimaryMenu', next);
            });
        },
        function(next){

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
                primaryMenu = Ext.getCmp('primaryMenu');//Ext.dom.Query.select('#primaryMenu');

            t.it('should load the menu trigger', function(t){
                t.ok(menuTrigger);
            });

            t.it('menu should be hidden to start', function(t) {
                t.isComponentNotVisible(primaryMenu, 'The primary menu is hidden');
            });
            // t.click(menuTrigger);

            //t.isComponentVisible(primaryMenu, 'The primary menu is not visible');
        });
});