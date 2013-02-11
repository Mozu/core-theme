/**
 * @class Taco.core.ux.Panel
 * @author Jimmy Sanford
 * Overrides Ext.panel.Panel.
 */


    Ext.define('Taco.core.ux.Panel', {
        override: 'Ext.panel.Panel',

        ui: 'taco',

        constructor: function () {
            this.callParent(arguments);
        }
    });