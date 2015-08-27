using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    
    public class PreAuthorizeTransactionTypeDataContract
    {
        public int Id { get; set; }

        public string Type { get; set; }

        public string Description { get; set; }
    }
}
