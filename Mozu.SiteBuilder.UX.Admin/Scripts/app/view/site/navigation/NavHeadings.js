/**
 * @class Taco.view.site.navigation.NavHeadings
 * @author james_zetlen
 * A feature that enables the special status of headings in the navigation tree grid.
 */
Ext.define('Taco.view.site.navigation.NavHeadings', {
    extend: 'Ext.grid.feature.Feature',
    init: function (grid) {
        var me = this,
            view = me.view;
        view.addRowTpl(new Ext.XTemplate('{% if (values.record.parentNode.isRoot()) values.itemClasses.push("' + Taco.baseCSSPrefix + 'treelist-inline-header"); this.nextTpl.applyOut(values, out, parent); %}'));
        
        function cancelRowInteraction(grid, record) {
            return !record.parentNode.isRoot();
        }

        grid.on({
            beforeselect: cancelRowInteraction,
            beforeitemclick: cancelRowInteraction,
            beforeitemmouseenter: cancelRowInteraction
        });

        view.on('nodedragover', function (target, dir) {
            return !(target.parentNode.isRoot() && dir !== "append");
        });
        
    }
});