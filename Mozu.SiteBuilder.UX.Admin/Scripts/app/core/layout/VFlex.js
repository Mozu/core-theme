/**
 * @class Taco.core.layout.VFlex
 * A layout that arranges items vertically down a container, similar to VBox. HFlex is content-agnostic, relying purely on 
 * CSS to arrange items quickly while maintaining normal flow (i.e., without inline styles and absolute positioning).
 */
Ext.define('Taco.core.layout.VFlex', {
    extend: 'Ext.layout.container.Auto',
    alias: 'layout.vflex',

    constructor: function (config) {
        Ext.apply(config, {
            targetCls: Taco.baseCSSPrefix + 'vflex-ct'
        });

        this.callParent(arguments);
    }
});