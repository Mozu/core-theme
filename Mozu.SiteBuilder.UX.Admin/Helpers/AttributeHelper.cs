using Mozu.SiteBuilder.UX.Admin.MockServices;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public class AttributeHelper : IAttributeHelper
    {
        private readonly IMoreAwesomeAttributeWebApiClient _attributeWebApiClient;

        public AttributeHelper(IMoreAwesomeAttributeWebApiClient attributeWebApiClient)
        {
            _attributeWebApiClient = attributeWebApiClient;
        }
    }
}