/**
 * @class Taco.store.EnitiyVariations
 * Used For Enitiy Variations
 *      - Holds a copy of the orignalParnetDoc on originalDocument
 *      - Creating and handling of which variations are selected is handled here
 *      - Sort/Rank is reversed for display purposes on the grid  
 */

Ext.define('Taco.store.EntityVariations', {
    id: 'entityVariationStore',
    extend: 'Ext.data.Store',
    model: 'Taco.model.EntityVariation',
    pageSize: 50,
    remoteSort: false,
    remoteFilter: false,
    sorters: [{
        sorterFn: function (o1, o2) {
            var getRank = function (o) {
                var rank = o.get('properties').rank;
                if (rank) {
                    return rank;
                } else {
                    return -1;
                }
            },
                rank1 = getRank(o1),
                rank2 = getRank(o2);

            return rank1 > rank2 ? -1 : 1;
        }
    }],
    storeManagerConfig: {
        createOnly: false
        // autoLoad: true
    },
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/entities/variations/read',
            create: '/admin/app/entities/variations/create',
            update: '/admin/app/entities/variations/update',
            destroy: '/admin/app/entities/variations/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    },
    originalDocument: null,
    /**
     * Creates a Unique variation Id based off the parent Id and an appended -{id}
     */
    createUniqueId: function () {
        var me = this,
            id = me.getCount();

        if (me.originalDocument.get('documentTypeFQN') == "categoryContent@mozu" && !me.originalDocument.get('id')) {
            return me.originalDocument.get('name');
        }

        function hasVairationId(id) {
            return me.findRecord('id', id);
        };

        if (id) {
            while (hasVairationId(me.last().get('parentId') + '-' + id)) {
                id++;
            }
            return me.last().get('parentId') + '-' + id;
        }
        return "";
    },
    /**
     * Creates and adds a new variation to the store
     *      - If Duplicate Id is passed we try to copy that variation's data if not we use the base page
     */
    createNewVariation: function (variationName, duplicateId) {

        var me = this,
            uniqueVariationId = me.createUniqueId(),
            newRecord = {};


        if (duplicateId) {
            var recordToCopy = me.findRecord('id', duplicateId);
            if (recordToCopy) {

                //Merge Should perform a deep clone
                Ext.Object.merge(newRecord, recordToCopy.data);
                newRecord.id = uniqueVariationId;
                newRecord.entityId = uniqueVariationId;
                newRecord.name = variationName;

                if (newRecord.properties) {
                    if (newRecord.properties.variations) {
                        delete newRecord.properties.variations;
                        delete newRecord.properties.variationId;
                    }
                }
                newRecord.active = false;
            }
        } else {
            newRecord.id = uniqueVariationId;
            newRecord.entityId = uniqueVariationId;
            newRecord.name = "";
        }

        var record = Ext.create(me.model.getName(), newRecord);
        record.phantom = true;
        return this.insert(0, record);
    },
    /**
     * Removes the state of which ever variations are set as selected/active
     *      - Updates the current active variation session 
     */
    untagActivetVariation: function () {
        var tagged = this.findRecord('active', true);

        window.sessionStorage.setItem('currentVariationEdit', "");

        var recordIdentifier = (this.originalDocument.get('listFQN') === "catalogContent@mozu")
            ? this.originalDocument.get('name')
            : this.originalDocument.get('id');

        var activeVariations = window.sessionStorage.getItem('activeVariations');
        activeVariations = JSON.parse(activeVariations) || {};
        activeVariations[recordIdentifier] = "";
        window.sessionStorage.setItem("activeVariations", JSON.stringify(activeVariations));

        if (tagged) {
            tagged.set('active', false)
        }
    },
    /**
     * Sets the state of whichever variation to selected/active
     *      - Updates the current active variation session 
     */
    tagActiveVariation: function (variation) {
        this.untagActivetVariation();

        window.sessionStorage.setItem('currentVariationEdit', variation.get('id'));

        var recordIdentifier = (this.originalDocument.get('listFQN') === "catalogContent@mozu")
            ? this.originalDocument.get('name')
            : this.originalDocument.get('id');

        var activeVariations = window.sessionStorage.getItem('activeVariations');
        activeVariations = JSON.parse(activeVariations) || {};
        activeVariations[recordIdentifier] = variation.get('id');
        window.sessionStorage.setItem("activeVariations", JSON.stringify(activeVariations));

        return variation.set('active', true);
    },
    /**
     * Returns the current active/selected variation
     */
    getActiveVariation: function () {
        return this.findRecord('active', true);
    },
    /**
     * Updates the Original Document on the store with whatever variation is passed in.
     *      - This is due to the need for us to update the local state of the Original Document (akait's nested variations) . 
     *      Which can be separately edited and saved. 
     */
    updateOriginalDocumentVariation: function (rawVariation) {
        var variations = this.originalDocument.get('properties').variations || [];

        if (variations.length) {
            var variationIdx = -1;
            Ext.Array.forEach(variations, function (item, idx) {
                if (item.id === rawVariation.id) {
                    variationIdx = idx;
                }
            })
            if (variationIdx !== -1) {
                variations[variationIdx] = rawVariation;
            }
        }
    },
    //Ext findRecord dose not correctly do an exact find
    findRecord: function (prop, value) {
        var record = null;
        this.each(function (item) {
            if (item.get(prop) === value) {
                record = item;
                return false;
            }
        });
        return record;
    }
});