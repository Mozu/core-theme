(function(win, doc) {

    class ChorizoHelper {
        init(chorizoClass) {
            doc.addEventListener('DOMContentLoaded', function() {
                const className = String(chorizoClass).toLowerCase();
                if (!win.Chorizo) {
                    win.Chorizo = {};
                }

                Chorizo[className] = new chorizoClass();
                Chorizo[className].init();
            });
        }

        factory(selector, className) {
            Array.prototype.forEach.call(document.querySelectorAll(selector), function(element) {
                if (!this.isInEditableDropzone(element)) {
                    return false;
                }

                // don't init columns if their direcent children of dropzones
                if (element.parentNode
                        && element.parentNode.parentNode
                        && !element.parentNode.parentNode.classList.contains('mz-cms-grid')) {
                    let el = new className(element);
                }

            }, this);

        }

        isInEditableDropzone(element) {

            let parent = element;

            while (parent && parent !== document.body) {
                if (parent && parent.classList && parent.classList.contains('mz-drop-zone')) {
                    // if our dropzone has meta data, we know it's editable
                    if (parent.getAttribute('data-drop-zone')) {
                        return true;
                    }
                }
                parent = parent.parentNode;
            }

            return false;
        }

    }

    doc.addEventListener('DOMContentLoaded', function() {
        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        Chorizo.helper = new ChorizoHelper();
    });

})(window, document);