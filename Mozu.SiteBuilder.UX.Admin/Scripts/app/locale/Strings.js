Ext.define("Taco.locale.Strings", {
    singleton: true,
    store: null,

    get: function (id) {

        this.store = Ext.data.StoreManager.lookup('Taco.store.LocalizedStrings');

        if (!this.store) {
            console.log("No store");
            return id + " NOT FOUND";
        } else {
            var record = this.store.getById(id);

            if (record) {
                return record.get("value");
            }

            return id + " NOT FOUND";
        }
    }
});
