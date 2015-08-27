/**
* Reports controller.*/
Ext.define('Taco.controller.Reports', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.report.Index'
        
        // theme test for poc. 
        //, 'Taco.view.report.Theme'
    ],
    theme: function () {
        //this.createContentView('Taco.view.report.Theme');
    }
});