/**
* @class Taco.controller.BusinessIntelligence
*/
Ext.define('Taco.controller.BusinessIntelligence', {
    extend: 'Taco.core.Controller',
    views: [
        'Taco.view.businessIntelligence.Index'
    ],
    index: function () {
        this.createContentView('Taco.view.businessIntelligence.Index');
    }
});