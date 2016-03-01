export function factory(selector, className) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function(element) {
        if (!isInEditableDropzone(element)) {
            return false;
        }

        // don't init columns if their direcent children of dropzones
        if (element.parentNode
                && element.parentNode.parentNode
                && !element.parentNode.parentNode.classList.contains('mz-cms-grid')) {
            /* eslint-disable no-unused-vars */
            const el = new className(element);
        }

    }, this);
}

export function isInEditableDropzone(element) {
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