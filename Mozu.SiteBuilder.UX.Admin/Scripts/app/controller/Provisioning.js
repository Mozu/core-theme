/**
 * @class Taco.controller.Products
 * @author Jason Cochran
 * The Products controller
 */

Ext.define('Taco.controller.Provisioning', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.provisioning.Index',
        'Taco.view.provisioning.Catalogs',
        'Taco.view.provisioning.Sites'
    ],
  
    models: ['Taco.model.Product'],
    catalogs: function(cfg) {
        var me = this;
        me.confirmContext('Taco.view.provisioning.Catalogs', function() {
            me.ensureRequiredStores(function() {
                me.createContentView('Taco.view.provisioning.Catalogs', cfg);
            });
        });
    },
    sites: function(cfg) {
        var me = this;
        me.confirmContext('Taco.view.provisioning.Sites', function() {
            me.ensureRequiredStores(function() {
                me.createContentView('Taco.view.provisioning.Sites', cfg);
            });
        });
    }
});