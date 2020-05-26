/**
* @class Taco.model.Category
* @author Jason Cochran
* The Category model
*/

Ext.define('Taco.model.Category', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Product','Taco.core.data.CategoryTreeProxy', 'Taco.model.FacetSet', 'Taco.data.CategoryReader' ],//, 'Taco.model.Facetable'],
    //fields: ['id', 'name', 'description', 'sequence', 'isDisplayed'],
    behaviors: {
        read: 16,
        create: 17,
        update: 19,
        destroy: 18
    },
    fields: [
        { name: 'leaf', type: 'boolean' },
        {
            "name": "id",
            "type": "int",
            "useNull": true
        }, {
            name: 'expandable',
            defaultValue: true,
            persist: false
        },
        {
            name: 'loaded',
            convert:function(v, record) {
                return record.get('loaded')|| record.data.id > 0;
            },
            persist: false
        },
        {
            name: 'checked',
            defaultValue: null,
            persist: false
        },
        {
            "name": "code",
            "type": "string",
            "useNull": true
        },
        {
            "name": "slug",
            "type": "string",
            "useNull": true
        },
        {
            "name": "path",
            "type": "string",
            "useNull": true
        },
        {
            "name": "isHidden",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "shouldSlice",
            "type": "boolean",
            "useNull": true,
            "defaultValue": true,
        },
        {
            "name": "parentId",
            "type": "int",
            "useNull": true
        }, {
            "name": "parentCode",
            "type": "string",
            "useNull": true
        }, {
            "name": "parentName",
            "type": "string",
            "useNull": true
        }, {
            "name": "parentIsActive",
            "type": "boolean",
            "useNull": true
        }, {
            "name": "index",
            "type": "int",
            "useNull": false
        },{
            "name": "productCount",
            "type": "int",
            "useNull": true,
            persist: false
        },{
            "name": "childCount",
            "type": "int",
            "useNull": true,
            persist: false
        },{
             "name": "parent",
             "type": "auto",
             "useNull": true,
             persist: false
         },
        {
            "name": "name",
            "type": "string",
            "useNull": true
        },
        {
            name: 'nameAndCode',
            convert: function (v, record) {
                return record.get('name') + (!record.get('categoryCode') ? '' : " (" + record.get('categoryCode') + ")");
            },
            persist: false
        },
        {
            name: 'nameAndCodeAndStatus',
            convert: function(v, record) {
                var result = record.get('name');
                result += !record.get('categoryCode') ? '' : ' (' + record.get('categoryCode') + ')';
                result += record.get('isActive') ? '' : ' (disabled)';
                return result;
            },
            persist: false
        },
        {
            name: 'fullPath',
            type: 'string',
            persist: false
        },
        {
            name: 'isActive',
            type: 'boolean',
            useNull: true
        },
        {
            "name": "description",
            "type": "string",
            "useNull": true
        },
        {
            "name": "sequence",
            "type": "int",
            "useNull": true
        },
        {
            "name": "pageTitle",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaTitle",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaDescription",
            "type": "string",
            "useNull": true
        },
        {
            "name": "metaKeywords",
            "type": "string",
            "useNull": true
        },
        {
            name: "categoryCode",
            type: "string",
            useNull: true
        },
        {
            name: 'categoryId',
            type: 'int'
        },
        {
            name: 'categoryType',
            type: 'string',
            defaultValue:"Static"
        },
        {
            name: 'dynamicExpression',
            type: 'object',
            serialize : function (v, r) {
                if (r.get("categoryType")=="Static") {
                    return null;
                }
                return v;
            },
            defaultValue: {
                "text": "",
                "type":"DynamicPreComputed",
                "tree": {
                    "type": "container",
                    "logicalOperator": "or",
                    "nodes": []
                }
            }
        },
        {
            "name": "categoryImages",
            "type": "array",
            "defaultValue":[],
            "useNull": true
        }, {
            name: 'catalogId',
            type: 'int',
            persist: false
        }, {
            name: 'cascadeDelete',
            type: 'boolean',
            defaultValue: false
        }

    ],

    validations: [
        { type: 'length', name: 'name', min: 3 },
        { type: 'presence', name: 'name' }

    ],

    beforeDuplicate: function () {
        var suffix = " - Copy";
        this.data.name = this.data.name + suffix;
        this.data.categoryCode = '';
        this.commit();
    },

    getFacetSets: function () {
        if (this.facetSetStore) {
            return this.facetSetStore;
        }
        
        this.facetSetStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.FacetSet',
           autoLoad: false
        });
        this.facetSetStore.load({
            params: {
               id: this.getId()
            }
        });

        return this.facetSetStore;
    },

    proxy: {
      //  type: 'ajax',
        type: 'categorytree',
        //forTreeStore:true,
        api: {
            create: '/admin/app/category/create',
            read: '/admin/app/category/read',
            update: '/admin/app/category/update',
            destroy: '/admin/app/category/delete',
            duplicate: '/admin/app/category/duplicate'
        },
        url: '/admin/Scripts/app/mocks/categories.json',
        reader: {
            type: 'taco.data.categoryreader',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    },

    mockApi: {
        read: '/admin/Scripts/app/mocks/categories.json'
    }
});
