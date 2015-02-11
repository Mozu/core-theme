/**
* @class Taco.store.MediaAssociations
*/

Ext.define('Taco.store.MediaAssociations', {
    extend: 'Taco.store.shared.BaseStore',
    model: 'Taco.model.MediaAssociation',
    proxy: 'memory',

    buffered: false,
    remoteFilter: false,
    remoteSort: false,
    sorters: [{
        sorterFn: function (m1, m2) {
            var seq1 = (m1.get) ? m1.get('sequence') : m1.sequence,
                seq2 = (m2.get) ? m2.get('sequence') : m2.sequence;
            if (seq1 === seq2) {
                return 0;
            }
            return seq1 < seq2 ? -1 : 1;
        }
    }]
});