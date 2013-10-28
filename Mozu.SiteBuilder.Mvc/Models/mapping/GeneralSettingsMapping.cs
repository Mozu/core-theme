using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Settings;


namespace Mozu.SiteBuilder.Mvc.Models.ModelMapping
{
    public class GeneralSettingsMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            //Mapper.CreateMap<PlatformService.Contracts.TimeZone, UX.Models.Settings.TimeZone>();

          
            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>();

            //Mapper.CreateMap<UX.Models.Settings.GeneralSettings, Mozu.SiteSettings.General.Contracts.GeneralSettings>()
            //      .ForMember(x => x.IPBlocks, o => o.Ignore());
        }
    }
}