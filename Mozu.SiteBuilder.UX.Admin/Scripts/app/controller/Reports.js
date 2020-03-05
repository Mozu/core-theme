/**
* Reports controller.*/
Ext.define('Taco.controller.Reports', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.report.ReportView'
    ],
    indexView: 'Taco.view.report.ReportView',
    theme: function () {
        
    }
});