/**
 * @class Taco.core.layout.HFlex
 * A layout that arranges items horizontally across a container, similar to HBox. HFlex is content-agnostic, relying purely on 
 * CSS to arrange items quickly while maintaining normal flow (i.e., without inline styles and absolute positioning).
 */
Ext.define('Taco.core.layout.HFlex', {
    extend: 'Ext.layout.container.Auto',
    alias: 'layout.hflex',

    constructor: function (config) {
        Ext.apply(config, {
            targetCls: Taco.baseCSSPrefix + 'hflex-ct'
        });

        this.callParent(arguments);
    }
});