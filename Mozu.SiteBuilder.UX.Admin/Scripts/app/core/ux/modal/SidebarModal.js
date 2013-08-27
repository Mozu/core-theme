/**
 * @class Taco.core.ux.modal.SidebarModal
 * Modal that covers an entire Taco.core.ux.content.Sidebar.
 * Multiple SidebarModals can be appended to the sidebar, but only one should be showing at a time.
 * It remains to be seen how we will enforce this, I suppose.
 */

Ext.define('Taco.core.ux.modal.SidebarModal', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.sidebarmodal',

    componentCls: Taco.baseCSSPrefix + 'sidebar-modal',
    floating: true,
    shadow: false,
    width: 320,

    statics: {
        active: []
    },

    isActive: function() {
        var active = this.statics().active;
        return active[active.length - 1] === this && this.rendered && !this.hidden;
    },

    fitOverSidebar: function() {
        if (this.isActive()) {
            this.sidebar = this.sidebar || this.up('sidebar');
            this.setSize(this.sidebar.getSize());
            this.alignTo(this.sidebar.getEl(), 'tl-tl');
        }
    },

    initComponent: function () {
        this.callParent(arguments);
        //this.mon(Taco.app.viewPort, 'resize', function () {
        //    if (this.rendered && !this.hidden) {
        //        this.alignTo(this.sidebar.getEl(), 'tl-tl');
        //        this.
        //    }
        //}, this);
        //this.on('boxready',function () {
        //    this.sidebar = this.sidebar || this.up('sidebar');
        //    this.setSize(this.sidebar.getSize());
        //    this.anchorTo(this.sidebar.getEl(), 'tl-tr');
        //}, this);
        this.mon(Taco.app.viewPort, 'resize', this.fitOverSidebar, this);
        this.on('boxready', this.fitOverSidebar, this);
    },

    show: function () {
    //    el.addCls('sliding showing');
    //    ext.defer(function () {
    //        el.removecls('sliding');
    //    }, 500);
        this.callParent(arguments);
        this.statics().active.push(this);
        this.fitOverSidebar();
    },

    hide: function () {
        this.alignTo(this.sidebar.getEl(), 'tl-tr');
        this.callParent(arguments);
        this.statics().active.pop();
    }
});