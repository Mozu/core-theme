/**
 * @class Taco.core.ux.Panel
 * Panel that implements Taco.core.ux.PanelDD
 */


    Ext.define('Taco.core.ux.Panel', {
        extend: 'Ext.panel.Panel',
        requires: 'Taco.core.ux.PanelDD',
        alias: 'widget.basepanel',
        cls: 'taco-basepanel',

        initDraggable: function () {
            this.dd = Ext.create('Taco.core.ux.PanelDD', this, Ext.isBoolean(this.draggable) ? null : this.draggable);
        }
    });