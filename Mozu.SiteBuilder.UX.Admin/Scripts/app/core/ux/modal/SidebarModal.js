/**
 * @class Taco.core.ux.modal.SidebarModal
 * Modal that covers an entire Taco.core.ux.content.Sidebar.
 * Multiple SidebarModals can be appended to the sidebar, but only one should be showing at a time.
 * It remains to be seen how we will enforce this, I suppose.
 */

Ext.define('Taco.core.ux.modal.SidebarModal', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.sidebarmodal',
    floating: true,
    shadow: false,
    componentCls: Taco.baseCSSPrefix + 'sidebar-modal',
    width: 300,
    listeners: {
        boxready: function () {
            this.sidebar = this.sidebar || this.up('sidebar');
            this.setSize(this.sidebar.getSize());
            this.alignTo(this.sidebar.getEl(), 'tl-tr');
        }
    },
    show: function () {
    //    el.addCls('sliding showing');
    //    ext.defer(function () {
    //        el.removecls('sliding');
    //    }, 500);
        this.callParent(arguments);
        this.alignTo(this.sidebar.getEl(), 'tl-tl');
    },
    hide: function () {
        this.alignTo(this.sidebar.getEl(), 'tl-tr');
        this.callParent(arguments);
    },
    initComponent: function () {
        this.callParent(arguments);
        this.mon(Taco.app.viewPort, 'resize', function () {
            if (this.rendered && !this.hidden) this.alignTo(this.sidebar.getEl(), 'tl-tl');
        }, this);
    }
});