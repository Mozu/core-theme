/**
 * @author James Zetlen
 * @class Taco.core.ux.PanelHeaderStat
 * A title and a statistic.
 */

    Ext.define('Taco.core.ux.PanelHeaderStat', {
        extend: 'Ext.Component',
        alias: 'widget.panelheaderstat',
        componentCls: 'taco-panelheaderstat',
        formatter: function(s) { return s; },
        tpl: [
            '<span class="{cls}-label">{label}</span>',
            '<span class="{cls}-value">{value}</span>'
        ],
        initComponent: function() {
            this.data = {
                label: this.label,
                value: this.formatter(this.value),
                cls: this.componentCls
            };
            this.callParent(arguments);
        }
    });
