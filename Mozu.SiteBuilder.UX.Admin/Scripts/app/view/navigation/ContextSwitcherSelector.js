/**
 * @class Taco.view.navigation.ContextSwitcherSelector
 * @author Taco
 *
 */

 Ext.define('Taco.view.navigation.ContextSwitcherSelector', {
    extend: 'Taco.core.ux.picker.Selector',

    callToActionText: 'Switch Site:',

    initComponent: function () {

        this.store = this.buildStore();

        this.cls += ' taco-context-switcher-selector';

        this.flyoutCfg = {
            alignment: 'tl-br?',
            alignmentOffsets: [-30, -15]
        };

        this.callParent(arguments);

        this.on({
            select: function (view, record) {
                Taco.app.context.setCurrentSite(record.get('value'));
            }
        });
    },

    buildStore: function () {
        var ret = [];

        Ext.each(Taco.app.context.masterCatalogs, function (mc) {
            Ext.each(mc.sites, function (s) {
                ret.push([s.id, s.name]);
            }, this);
        }, this);

        this.value = Taco.app.context.getContextAtLevel('s').id;

        return ret;
    }
 });