using System.Configuration;

namespace Mozu.SiteBuilder.Mvc.Orders
{
    public interface IPciSettingsProvider
    {
        string GetPaymentApiBase();
    }
}