using System;
using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Facets;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class FacetMapping : Profile
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
            // To model
            Mapper.CreateMap<DC.FacetSet, FacetSet>()
                .ForMember(x => x.CategoryId, op => op.Ignore())
                ;

            // To data contract
            Mapper.CreateMap<FacetSet, DC.FacetSet>();


            // To model
            Mapper.CreateMap<DC.Facet, Facet>()
                  .ForMember(x => x.SourceId, op => op.ResolveUsing(x => (x.Source != null) ? x.Source.Id : null))
                  .ForMember(x => x.SourceName, op => op.ResolveUsing(x => (x.Source != null) ? x.Source.Name : null))
                  .ForMember(x => x.SourceType, op => op.ResolveUsing(x => (x.Source != null) ? x.Source.Type : null))
                  .ForMember(x => x.SourceDataType, op => op.ResolveUsing(x => (x.Source != null) ? x.Source.DataType : null))
                  .ForMember(x => x.ValidityIsValid, op => op.ResolveUsing(x => (x.Validity != null && x.Validity.IsValid) ))
                  .ForMember(x => x.AllowsRangeQuery, op => op.ResolveUsing(x =>(x.Source != null && x.Source.AllowsRangeQuery) ))
                  .ForMember(x => x.ValidityReasonCode, op => op.ResolveUsing(dc => (dc.Validity != null) ? dc.Validity.ReasonCode : null)) 
                  ;

           
            // To data contract
            Mapper.CreateMap<Facet, DC.Facet>()
                  .ForMember(x => x.Source, op => op.ResolveUsing(x => new DC.FacetSource {Id = x.SourceId, Name = x.SourceName, Type = x.SourceType}))
                  //.ForMember(x => x.FacetType, op => op.ResolveUsing(x => x.RangeQueries != null && x.RangeQueries.Count > 0 ? "RangeQuery" : "Value"))
                 //todo: confirm FacetValidity mapping Greg Murray on 2014-01-24
                 .ForMember( x=> x.Validity , op=> op.Ignore())
                  //.ForMember(dc => dc.Validity, op => op.ResolveUsing(x => new DC.FacetValidity()
                  //    {
                  //        IsValid = x.ValidityIsValid, ReasonCode = x.ValidityReasonCode
                  //    }))
                  //ignores
                  .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                  ;
                  
            // To model
            Mapper.CreateMap<DC.FacetRangeQuery, FacetRangeQuery>();

            // To data contract
            Mapper.CreateMap<FacetRangeQuery, DC.FacetRangeQuery>();

            // To model
            Mapper.CreateMap<DC.FacetSource, FacetSource>();

            // To data contract
            Mapper.CreateMap<FacetSource, DC.FacetSource>()
                .ForMember(dc => dc.DataType, op => op.Ignore());


        }


    }
}