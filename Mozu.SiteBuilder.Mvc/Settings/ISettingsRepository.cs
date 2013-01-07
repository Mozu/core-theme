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

        UX.Models.Settings.CheckoutSettings Checkout
        {
            get;
        }

        SiteShippingSettings Shipping
        {
            get;
        }


    }
}
