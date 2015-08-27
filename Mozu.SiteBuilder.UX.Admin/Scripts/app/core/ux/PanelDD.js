/**
 * @class Taco.core.ux.PanelDD
 * DD implementation for Panels, customized for drag handles.
 */


    Ext.define('Taco.core.ux.PanelDD', {
        extend: 'Ext.panel.DD',

        setupEl: function (panel) {
            var me = this,
            handle = panel.handle,
            el = panel.body;

            if (handle) {
                me.setHandleElId(handle.id);
                el = handle.el;
            }
            if (el) {
                el.setStyle('cursor', 'move');
                me.scroll = false;
            } else {
                panel.on('boxready', me.setupEl, me, { single: true });
            }
        }
    });