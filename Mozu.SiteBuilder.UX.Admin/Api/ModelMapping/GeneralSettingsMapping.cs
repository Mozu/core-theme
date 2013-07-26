using System.Collections.Generic;
using System.Linq;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class GeneralSettingsMapping : Profile
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
            Mapper.CreateMap<Mozu.Reference.Contracts.TimeZone, UX.Models.Settings.TimeZone>();

            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.IPBlock, UX.Models.Settings.IPBlock>();
            Mapper.CreateMap<UX.Models.Settings.IPBlock, Mozu.SiteSettings.General.Contracts.IPBlock>();

            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>();
             //   .ForMember(x => x.IPBlocks, o => o.MapFrom(x => x.IPBlocks != null ? x.IPBlocks.Items : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()));
            Mapper.CreateMap<UX.Models.Settings.GeneralSettings, Mozu.SiteSettings.General.Contracts.GeneralSettings>();
            //.ForMember(x => x.IPBlocks, o => o.MapFrom(x => 
            //    new Mozu.SiteSettings.General.Contracts.IPBlockCollection
            //    {
            //        Items = x.IPBlocks != null ? x.IPBlocks.Select(Mapper.Map<Mozu.SiteSettings.General.Contracts.IPBlock>).ToList() : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()
            //    })
            //);
        }
    }
}