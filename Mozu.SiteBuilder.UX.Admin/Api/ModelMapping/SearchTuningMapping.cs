using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Search;
using DC = Mozu.ProductAdmin.Contracts.Search;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{

    public class SearchTuningMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<SearchTuningRule, DC.SearchTuningRule>()
                .ForMember(dc => dc.SearchTuningRuleCode, op => op.ResolveUsing(x => x.Code))
                .ForMember(dc => dc.SearchTuningRuleName, op => op.ResolveUsing(x => x.Name))
                .ForMember(dc => dc.SearchTuningRuleDescription, op => op.ResolveUsing(x => x.Description))
                .ForMember(dc => dc.SiteId, op => op.ResolveUsing(x => x.SiteId.GetValueOrDefault()))
            
                .ForMember(dc => dc.Filters, op => op.ResolveUsing(x => x.Filters.IsNullOrEmpty()
                        ? new List<DC.SearchTuningRuleFilter>()
                        : x.Filters.Select(y => new DC.SearchTuningRuleFilter {Field = y.Key, Value = y.Value}).ToList()            
                ))
            
                .ForMember(dc => dc.BoostedProductCodes, op => op.ResolveUsing(p => p.BoostedProducts.IsNullOrEmpty()
                                                                    ? new List<string>() 
                                                                    : p.BoostedProducts.Select(x => x.ProductCode).ToList()))
                .ForMember(dc => dc.BlockedProductCodes, op => op.ResolveUsing(p => p.BlockedProducts.IsNullOrEmpty()
                                                                    ? new List<string>()
                                                                    : p.BlockedProducts.Select(x => x.ProductCode).ToList()))

                .ForMember(dc => dc.Active, op => op.ResolveUsing(x => x.IsActive))

                .ForMember(dc => dc.ActiveStartDate, op => op.ResolveUsing(x => x.StartDate))
                .ForMember(dc => dc.ActiveEndDate, op => op.ResolveUsing(x => x.EndDate))
            
                //ignores
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;

            Mapper.CreateMap<DC.SearchTuningRule, SearchTuningRule>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.SearchTuningRuleCode))
                .ForMember(x => x.Code, op => op.ResolveUsing(dc => dc.SearchTuningRuleCode))
                .ForMember(x => x.Name, op => op.ResolveUsing(dc => dc.SearchTuningRuleName))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => dc.SearchTuningRuleDescription))
                .ForMember(x => x.SiteId, op => op.ResolveUsing(dc => dc.SiteId))

                .ForMember(x => x.Filters, op => op.ResolveUsing(dc => dc.Filters.IsNullOrEmpty()
                    ? new List<KeyValuePair<string, string>>()
                    : dc.Filters.Select(y => new KeyValuePair<string, string>(y.Field, y.Value)).ToList()
                    ))
   
                .ForMember(x => x.BoostedProducts, op => op.ResolveUsing(dc => dc.BoostedProductCodes.IsNullOrEmpty()
                                                            ? new List<SimpleSearchProduct>()
                                                            : dc.BoostedProductCodes.Select(x => new SimpleSearchProduct {ProductCode= x}).ToList()))
                .ForMember(x => x.BlockedProducts, op => op.ResolveUsing(dc => dc.BlockedProductCodes.IsNullOrEmpty()
                                                            ? new List<SimpleSearchProduct>()
                                                            : dc.BlockedProductCodes.Select(x => new SimpleSearchProduct { ProductCode = x }).ToList()))

                .ForMember(x => x.IsActive, op => op.ResolveUsing(dc => dc.Active))
                .ForMember(x => x.StartDate, op => op.ResolveUsing(dc => dc.ActiveStartDate))
                .ForMember(x => x.EndDate, op => op.ResolveUsing(dc => dc.ActiveEndDate))
            
                .ForMember(x => x.LastModifiedBy, op => op.ResolveUsing(dc => dc.AuditInfo != null
                    ? dc.AuditInfo.UpdateBy
                    : null))
                .ForMember(x => x.LastModifiedDate, op => op.ResolveUsing(dc => dc.AuditInfo != null
                    ? dc.AuditInfo.UpdateDate
                    : null))
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => dc.AuditInfo != null
                    ? dc.AuditInfo.CreateBy
                    : null))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo != null
                    ? dc.AuditInfo.CreateDate
                    : null))
                ;
        }
    }
}