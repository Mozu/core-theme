/**
 * @class Taco.view.order.subform.Subform
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.view.order.subform.Subform', {
    extend: 'Taco.core.ux.EditContainer',
    alias: 'widget.taco-order-subform',
    cls: Taco.baseCSSPrefix + 'order-subform',
    setHeaderTitle: function(status) {
        var header = this.getHeader();
        if (header) {
            header.setTitle(status);
        } else {
            this.on('afterrender', function() {
                this.setHeaderTitle(status);
            }, this, { single: true });
        }

    },
    setHeaderTitleStatus: function(title, status, theme) {
        var header = this.getHeader();
        if (header) {
            theme = theme || 'false'; // .#{$prefix}column-content-pill-{variant} in /Mozu.SiteBuilder/Mozu.SiteBuilder.UX.Admin/Scripts/sass/etc/taco/_panel.scss
            var tpl = '<div class="x-panel x-panel-header-text-container-subform"><span style="font-weight:normal;" class="x-panel-header-text">' + title + '</span></div>';
            if (status) {
                tpl += ' <span class="x-column-content-pill x-column-content-pill-' + theme + '">' + status + '</span>';
            }
            header.setTitle(tpl);
        } else {
            this.on('afterrender', function() {
                this.setHeaderTitleStatus(title, status, theme);
            }, this, { single: true });
        }

    }
});