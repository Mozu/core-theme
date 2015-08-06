/**
* @class Taco.core.ux.BaseGrid
* @author Ben Cripps
* The Draft Notifier shared between Product and SiteBuilder/CMS
*/

Ext.define('Taco.core.ux.DraftIcon', {
    extend: 'Ext.form.field.Text',
    requires: ['Taco.core.ux.TooltipLabel'],
    alias: 'widget.drafticon',
    cls: 'taco-draft-icon',
    margin: '0 0 0 20',
    width: 62,
    value: '',
    fieldLabel: 'DRAFT',
    hidden: true,

    initComponent: function () {
        Taco.core.ux.TooltipLabel.wrapConfig('publishset', this, this);

        this.callParent(arguments);
    },

    updateIconText: function(data) {
        this.show();
        this.updateMainText(data.title);
    },

    updateMainText: function(txt) {
       
    },

    listeners: {
        afterrender: function(cmp) {
            // console.log(cmp);
        }
    }
});