using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.Mvc.Models.Mapping
{
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class SettingsMapping : Profile
    {
         public override string ProfileName
        {
            get
            {
                return GetType().FullName;
            }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<ConfigurationField, RuntimeConfigurationField>();
        }
    }
}


