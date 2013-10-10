using System.Threading.Tasks;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Shipping.Contracts;

namespace Mozu.SiteBuilder.Mvc.Settings
{
    //tbd switch to viewmodels
    public interface  ISettingsRepository
    {
        Task<UX.Models.Settings.GeneralSettings> GetGeneralSettings();
        Task<UX.Models.Settings.SettingsContainer > GetSettings();
    }
}
