using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Settings;
using Newtonsoft.Json;
using GDC = Mozu.SiteSettings.General.Contracts;

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

            Mapper.CreateMap<ViewModeToggles, GDC.General.ViewAuthorizations>()
                .ForMember((GDC.General.ViewAuthorizations va) => va.RequireAuthForLive, op => op.ResolveUsing((ViewModeToggles vm) => vm.IsRequiredLoginForLiveEnabled))
                .ForMember((GDC.General.ViewAuthorizations va) => va.RequireAuthForPending, op => op.ResolveUsing((ViewModeToggles vm) => vm.IsRequiredLoginForStagingEnabled));
            Mapper.CreateMap<GDC.General.ViewAuthorizations, ViewModeToggles>()
                .ForMember((ViewModeToggles vm) => vm.IsRequiredLoginForLiveEnabled, op => op.ResolveUsing((GDC.General.ViewAuthorizations va) => va.RequireAuthForLive))
                .ForMember((ViewModeToggles vm) => vm.IsRequiredLoginForStagingEnabled, op => op.ResolveUsing((GDC.General.ViewAuthorizations va) => va.RequireAuthForPending));

            Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.IPBlock, UX.Admin.Api.Models.GeneralSettings.IPBlock>();
            Mapper.CreateMap<UX.Admin.Api.Models.GeneralSettings.IPBlock, Mozu.SiteSettings.General.Contracts.IPBlock>()
                //ignores
                .ForMember(x => x.StoreFrontBlock, op => op.Ignore())
                .ForMember(x => x.AdminBlock, op => op.Ignore())
                .ForMember(x => x.AuditInfo, op => op.Ignore())
                ;

            //Mapper.CreateMap<Mozu.SiteSettings.General.Contracts.GeneralSettings, UX.Models.Settings.GeneralSettings>()
            //    //ignores
            //    .ForMember(m => m.AdjustForDaylightSavingTime, op => op.Ignore())
            //    .ForMember(m => m.AllowAllIPs, op => op.Ignore())
            //    .ForMember(m => m.SenderEmailAddressName, op => op.Ignore())
            //    .ForMember(m => m.ChannelId, op => op.Ignore())
            //    .ForMember(m => m.DesktopTheme, opt => opt.ResolveUsing(x =>
            //    {
            //        if (string.IsNullOrEmpty(x.Theme))
            //        {
            //            if (x.Theme[0] == '{')
            //            {
            //                try
            //                {
            //                    return JsonConvert.DeserializeObject<ThemeSelection>(x.Theme);
            //                }
            //                catch
            //                {
            //                    //log
            //                }
            //            }
            //            else
            //            {
            //                return new ThemeSelection()
            //                {
            //                    Id = x.Theme
            //                };
            //            }
                        
            //        }
            //         return new ThemeSelection()
            //                   {
                                   
            //                   };;
            //    }))
            //    .ForMember(m => m.MobileTheme, opt => opt.ResolveUsing(x =>
            //    {
            //        if (string.IsNullOrEmpty(x.MobileTheme))
            //        {
            //            if (x.MobileTheme[0] == '{')
            //            {
            //                try
            //                {
            //                    return JsonConvert.DeserializeObject<ThemeSelection>(x.MobileTheme);
            //                }
            //                catch
            //                {
            //                    //log
            //                }
            //            }
            //            else
            //            {
            //                return new ThemeSelection()
            //                       {
            //                           Id = x.MobileTheme
            //                       };
            //            }
            //        }
            //        return new ThemeSelection();
            //    }));
           
            // //   .ForMember(x => x.IPBlocks, o => o.ResolveUsing(x => x.IPBlocks != null ? x.IPBlocks.Items : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()));
            //Mapper.CreateMap<UX.Models.Settings.GeneralSettings, Mozu.SiteSettings.General.Contracts.GeneralSettings>()
            //    //ignores
            //    .ForMember(dc => dc.IsMozuWebSite, op => op.Ignore())
            //    .ForMember(dc => dc.IsWishlistCreationEnabled, op => op.Ignore())
            //    .ForMember(dc => dc.TaxableTerritories, op => op.Ignore())
            //    .ForMember(dc => dc.AuditInfo, op => op.Ignore())
            //    ;
            //.ForMember(x => x.IPBlocks, o => o.ResolveUsing(x => 
            //    new Mozu.SiteSettings.General.Contracts.IPBlockCollection
            //    {
            //        Items = x.IPBlocks != null ? x.IPBlocks.Select(Mapper.Map<Mozu.SiteSettings.General.Contracts.IPBlock>).ToList() : new List<Mozu.SiteSettings.General.Contracts.IPBlock>()
            //    })
            //);
        }
    }
}