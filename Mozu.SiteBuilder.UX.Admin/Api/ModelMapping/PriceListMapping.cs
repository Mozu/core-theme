using System;
using System.Linq;
using AutoMapper;
using Mozu.Core.Extensions;
using DC = Mozu.ProductAdmin.Contracts;
using System.Collections.Generic;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class PriceListMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.PriceList, PriceList>()
                .ForMember(x => x.Code, op => op.ResolveUsing(dc => dc.PriceListCode))
                .ForMember(x => x.ParentCode, op => op.ResolveUsing(dc => dc.ParentPriceListCode))
                .ForMember(x => x.ParentName, op => op.ResolveUsing(dc => dc.ParentPriceListName))
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => dc.AuditInfo !=null ? dc.AuditInfo.CreateBy : null))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo !=null ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.UpdateBy, op => op.ResolveUsing(dc => dc.AuditInfo !=null ? dc.AuditInfo.UpdateBy : null))
                .ForMember(x => x.UpdateDate, op => op.ResolveUsing(dc => dc.AuditInfo !=null ? dc.AuditInfo.UpdateDate : null))
                .ForMember(x => x.CustomerSegments, op => op.ResolveUsing(dc => dc.MappedCustomerSegments))
                
                .ForMember(x => x.CustomerSegmentNames, op => op.Ignore())
                ;

            Mapper.CreateMap<PriceList, DC.PriceList>()
                .ForMember(dc => dc.PriceListCode, op => op.ResolveUsing(x => x.Code))
                .ForMember(dc => dc.ParentPriceListCode, op => op.ResolveUsing(x => string.IsNullOrEmpty(x.ParentCode) ? null : x.ParentCode))
                .ForMember(dc => dc.MappedCustomerSegments, op => op.ResolveUsing(x => x.CustomerSegments))
                .ForMember(dc => dc.AuditInfo, op => op.ResolveUsing(x => new AuditInfo
                {
                    CreateBy = x.CreateBy,
                    CreateDate = x.CreateDate,
                    UpdateBy = x.UpdateBy,
                    UpdateDate = x.UpdateDate
                }))
                .ForMember(x => x.ParentPriceListName, op => op.Ignore())
                ;

            Mapper.CreateMap<PriceListEntry, DC.PriceListEntry>()
                .ForMember(x => x.AuditInfo, op => op.Ignore())
                ;
            Mapper.CreateMap<DC.PriceListEntry, PriceListEntry>()
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.CreateBy : ""))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.UpdateBy, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.UpdateBy : ""))
                .ForMember(x => x.UpdateDate, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.UpdateDate : null))
                ;
            

            Mapper.CreateMap<PriceListEntryPrice, DC.PriceListEntryPrice>();
            Mapper.CreateMap<DC.PriceListEntryPrice, PriceListEntryPrice>();

        }
    }
}