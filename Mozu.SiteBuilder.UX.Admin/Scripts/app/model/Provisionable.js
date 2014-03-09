/**
 * @class Taco.core.context.StoreItem
 * @author Thomas Phipps the Wiener
 */

Ext.define('Taco.model.Provisionable', {
    extend: 'Taco.core.data.Model',
    fields: [
        'path',
        'id',
        'name',
        'status',
        'masterCatalogId',
        {
            name: 'defaultCurrencyCode'
        },
        {
            name: 'defaultLocaleCode',
        },
        {
            name: 'catalog',           
        }, {
            name: 'isMozuHosted',
            type: 'boolean'
        }
    ],
    idProperty: 'path'
});



/*
public class Site : BaseTenantEntityInternal
  {
    public int TenantId { get; set; }

    public int? MasterCatalogId { get; set; }

    public int? CatalogId { get; set; }

    public string CountryCode { get; set; }

    public string DefaultLocaleCode { get; set; }

    public string DefaultCurrencyCode { get; set; }

    public bool IsMozuRendered { get; set; }

    public List<Domain> Domains { get; set; }

    public string Status { get; set; }
     public int Id { get; set; }

    public string Name { get; set; }
  }
  public class Provisionable
        {
            public string Name { get; set; }
            public string LocaleCode { get; set; }
            public string CurrencyCode { get; set; }
            public int Id { get; set; }
            public string ItemType { get; set; }
            public bool Expanded { get; set; }
            public List<Provisionable> Items { get; set; }
            public string Path { get; set; }
            public bool Leaf { get; set; }
            public string Status { get; set; }
        }

*/

