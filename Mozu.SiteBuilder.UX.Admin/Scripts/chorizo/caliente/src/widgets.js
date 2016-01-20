(function(win, doc) {

    class Widgets {
        constructor() {

        }
        init() {
            console.log('init widgets');
        }
    }

    doc.addEventListener('DOMContentLoaded', function() {
        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        Chorizo.widgets = new Widgets();
        Chorizo.widgets.init();
    });

})(window, document);