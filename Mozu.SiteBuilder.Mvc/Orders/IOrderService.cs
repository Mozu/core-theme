using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Orders
{
    public interface IOrderService
    {
        
        List<KeyValuePair<string, string>> GetShippableCountries();

   

        //string GetMerchantId();
    }
}