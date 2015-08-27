using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    
    public class PreAuthorizeDefinition
    {
        public int Id { get; set; }

        public string PreAuthorizeTestUrl { get; set; }

        public string PreAuthorizeProdUrl { get; set; }

        public PreAuthorizeTransactionTypeDataContract Type { get; set; }
    }
}
