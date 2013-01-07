using System.Configuration;
using Mozu.SiteBuilder.Mvc.Orders;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class PciSettingsProvider : IPciSettingsProvider
    {
        public string GetPaymentApiBase()
        {
            return ConfigurationManager.AppSettings["pciPaymentApi"];
        }
    }
}