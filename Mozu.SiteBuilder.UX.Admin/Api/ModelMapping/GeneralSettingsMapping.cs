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
            Mapper.CreateMap<Mozu.Reference.Contracts.TimeZone, UX.Models.Settings.TimeZone>()
                .ForMember(x => x.Selected, op => op.Ignore());

            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.IPBlock, UX.Models.Settings.IPBlock>();
            Mapper.CreateMap<UX.Models.Settings.IPBlock, Mozu.SiteSettings.General.Contracts.IPBlock>()
                //ignores
                .ForMember(x => x.StoreFrontBlock, op => op.Ignore())
                .ForMember(x => x.AdminBlock, op => op.Ignore())
                .ForMember(x => x.AuditInfo, op => op.Ignore())
                ;

            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>()
                //ignores
                .ForMember(m => m.AdjustForDaylightSavingTime, op => op.Ignore())
                .ForMember(m => m.AllowAllIPs, op => op.Ignore())
                .ForMember(m => m.SenderEmailAddressName, op => op.Ignore())
                .ForMember(m => m.ChannelId, op => op.Ignore())
                .ForMember(m => m.DesktopTheme, op => op.Ignore());
           
             //   .ForMember(x => x.IPBlocks, o => o.ResolveUsing(x => x.IPBlocks != null ? x.IPBlocks.Items : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()));
            Mapper.CreateMap<UX.Models.Settings.GeneralSettings, Mozu.SiteSettings.General.Contracts.GeneralSettings>()
                //ignores
                .ForMember(dc => dc.IsMozuWebSite, op => op.Ignore())
                .ForMember(dc => dc.IsWishlistCreationEnabled, op => op.Ignore())
                .ForMember(dc => dc.TaxableTerritories, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;
            //.ForMember(x => x.IPBlocks, o => o.ResolveUsing(x => 
            //    new Mozu.SiteSettings.General.Contracts.IPBlockCollection
            //    {
            //        Items = x.IPBlocks != null ? x.IPBlocks.Select(Mapper.Map<Mozu.SiteSettings.General.Contracts.IPBlock>).ToList() : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()
            //    })
            //);
        }
    }
}