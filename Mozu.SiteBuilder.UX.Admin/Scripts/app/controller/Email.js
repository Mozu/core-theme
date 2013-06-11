/**
* Email controller.
* @author james_zetlen 
*/
Ext.define('Taco.controller.Email', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.model.GeneralSettings', 'Taco.view.email.Edit', 'Taco.view.email.Index'],
    index: function () {
        
        if (this.requiresSiteContext()) {
            return;
        }
        

        var me = this;
        Taco.model.GeneralSettings.load('', {
            success: function (record, o) {
                me.createContentView('Taco.view.email.Index', { record: record });
            }
        });
    },
    edit: function (params) {
        if (this.requiresSiteContext()) {
            return;
        }
        this.createContentView('Taco.view.email.Edit', { pageSrc: '/email/preview/' + params });// '/email/'+params.id });
    }
});