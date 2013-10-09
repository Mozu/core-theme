using System.Threading.Tasks;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Shipping.Contracts;

namespace Mozu.SiteBuilder.Mvc.Settings
{
    //tbd switch to viewmodels
    public interface  ISettingsRepository
    {
        UX.Models.Settings.GeneralSettings General
        {
            get;
        }

        SiteSettings.Order.Contracts.CheckoutSettings Checkout
        {
            get;
        }

        SiteShippingSettings Shipping
        {
            get;
        }

        Task<bool> AsyncInit();

    }
}
