/**
* Reports controller.*/
Ext.define('Taco.controller.Reports', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.report.Split'
    ],
    indexView: 'Taco.view.report.Split',
    theme: function () {
        //this.createContentView('Taco.view.report.Theme');
    }
});