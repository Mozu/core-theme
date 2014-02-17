using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    
    public enum AttributeDataType
    {
        None = 0,
        Bool = 1,
        DateTime = 2,
        Number = 3,
        String = 4,
    }

    //noAttrBefore but can't apply JsonIgnore to enum - Greg Murray on 2014-02-16 
    public enum ProductTypeAttributeUsage
    {
        option,extra,property
    }
}