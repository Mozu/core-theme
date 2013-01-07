/**
* Email controller.
* @author james_zetlen 
*/
Ext.define('Taco.controller.Email', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.model.GeneralSettings', 'Taco.view.email.Edit', 'Taco.view.email.Index'],
    index: function () {
        var me = this;
        Taco.model.GeneralSettings.load('', {
            success: function (record, o) {
                me.createContentView('Taco.view.email.Index', { record: record });
            }
        });
    },
    edit: function (params) {
       
        this.createContentView('Taco.view.email.Edit', { pageSrc: '/email/preview/' + params });// '/email/'+params.id });
    }
});