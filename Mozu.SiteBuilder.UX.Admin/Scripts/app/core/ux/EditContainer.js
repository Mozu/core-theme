/**
 * @class Taco.core.ux.EditContainer
 * @author Jimmy Sanford
 */
Ext.define('Taco.core.ux.EditContainer', {
    // extend: 'Ext.container.Container',
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco-editcontainer',
    bodyPadding: '11 0 19',
    ui: 'subform',

    headerToolbar:true,

    initComponent: function () {
        var me = this;
        this.callParent(arguments);
    }
});