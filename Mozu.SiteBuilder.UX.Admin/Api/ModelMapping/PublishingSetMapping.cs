using System;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using AutoMapper;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PublishSets;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using PC = Mozu.ProductAdmin.Contracts;
using DC = Mozu.Content.Contracts;
using SE = Mozu.ScheduledEvent.Contracts;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class PublishingSetMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            // To model

            Mapper.CreateMap<DC.DocumentDraftSummary, PublishSetItem>()
                .ForMember(x => x.Type, opt => opt.UseValue("cms"));
            Mapper.CreateMap<PublishSetItem, DC.DocumentDraftSummary>();

            Mapper.CreateMap<SE.PublishSet, PublishSet>();
            Mapper.CreateMap<PublishSet, SE.PublishSet>();

            Mapper.CreateMap<PC.Product, PublishSetItem>()
                .ForMember(x => x.Type, opt => opt.UseValue("product"))
                .ForMember(x => x.Name, op => op.ResolveUsing(y => y.Content.ProductName))
                .ForMember(x => x.DraftUpdateDate, op => op.ResolveUsing(y => y.AuditInfo.UpdateDate))
                .ForMember(x => x.UpdatedBy, op => op.ResolveUsing(y => y.AuditInfo.UpdateBy))
                .ForMember(x => x.Id, op => op.ResolveUsing(y => y.ProductCode))
                .ForMember(x => x.PublishSetCode, op => op.ResolveUsing(y => y.PublishingInfo.PublishSetCode))
                .ForMember(x => x.LastPublishDate, op => op.ResolveUsing(y => y.PublishingInfo.LastPublishedDate))
                .ForMember(x => x.LastPublishedBy, op => op.ResolveUsing(y => y.PublishingInfo.LastPublishedBy))
                .ForMember(x => x.PublishType, op => op.ResolveUsing(y => y.PublishingInfo.PublishedState));
                
            Mapper.CreateMap<PublishSetItem, DC.DocumentDraftSummary>();
        }
    }
}