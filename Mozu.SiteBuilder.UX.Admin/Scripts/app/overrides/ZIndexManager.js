// This is a bug fix to correct the focus handling.  after a button spawned menu hides.
// if the menu button is in a floating container (window) then the window will get focus after the menu hides
// with this override the button will get focus after the menu hides.
// see this bug report:
// http://www.sencha.com/forum/showthread.php?282354-Menu-button-does-not-regain-focus-when-its-menu-is-closed-when-inside-of-a-window&p=1034039#post1034039
// fix for Ext 4.2.2
// steps to test bug fix in future extjs releases:
//  comment out this override
//  open order detail editor    
//  tab to the order adjumstment label button and hit down arrow
//  hit escape key
//  if label button gets focus when the menu hides then the bug is fixed in the new release

Ext.define('Taco.overrides.ZIndexManager', {
    override: 'Ext.ZIndexManager',
    register: function (comp) {
        var me = this,
            compAfterHide = comp.afterHide;

        if (comp.zIndexManager) {
            comp.zIndexManager.unregister(comp);
        }
        comp.zIndexManager = me;

        me.map[comp.id] = comp;
        me.zIndexStack.push(comp);

        // Hook into Component's afterHide processing
        comp.afterHide = function () {
            
            // reverse the order of these calls;
            // this gets called first so that the default zindes focus logic executes
            me.onComponentHide(comp);
            // this is the code sub class specific focus logic. it needs to get called second
            compAfterHide.apply(comp, arguments);
        };
    }   
});