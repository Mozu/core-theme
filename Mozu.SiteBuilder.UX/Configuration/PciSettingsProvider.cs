using System.Configuration;
using Mozu.SiteBuilder.Mvc.Orders;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.UX.Configuration
{
    public class PciSettingsProvider : IPciSettingsProvider
    {
        public string GetPaymentApiBase()
        {
            return MozuConfigurationManager.AppSettings("service-url-StorefrontCardsWebApi");
        }
    }
}