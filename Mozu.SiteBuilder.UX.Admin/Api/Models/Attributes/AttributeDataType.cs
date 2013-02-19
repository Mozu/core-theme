using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public enum AttributeDataType
    {
        None = 0,
        Bool = 1,
        DateTime = 2,
        Number = 3,
        String = 4,
    }

    public enum ProductTypeAttributeUsage
    {
        option,extra,property
    }
}