using System;
using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Facets;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class FascetMapping : Profile
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
            Mapper.CreateMap<DC.FacetSet, FacetSet>();

            // To data contract
            Mapper.CreateMap<FacetSet, DC.FacetSet>();


            // To model
            Mapper.CreateMap<DC.Facet, Facet>()
                  .ForMember(x => x.SourceId, op => op.MapFrom(x => x.Source.Id))
                  .ForMember(x => x.SourceName, op => op.MapFrom(x => x.Source.Name))
                  .ForMember(x => x.SourceType, op => op.MapFrom(x => x.Source.Type))
                  .ForMember(x => x.ValidityIsValid, op => op.MapFrom(x => x.Validity.IsValid))
                  
                  .ForMember(x => x.ValidityReasonCode, op => op.MapFrom(x => x.Validity.ReasonCode));
                   


            // To data contract
            Mapper.CreateMap<Facet, DC.Facet>()
                  .ForMember(x => x.Source, op => op.ResolveUsing(x => new DC.FacetSource {Id = x.SourceId, Name = x.SourceName, Type = x.SourceType}))
                  .ForMember(x => x.FacetType, op => op.ResolveUsing(x => x.RangeQueries != null && x.RangeQueries.Count > 0 ? "RangeQuery" : "Value"));
                  

            // To model
            Mapper.CreateMap<DC.FacetRangeQuery, FacetRangeQuery>();

            // To data contract
            Mapper.CreateMap<FacetRangeQuery, DC.FacetRangeQuery>();

            // To model
            Mapper.CreateMap<DC.FacetSource, FacetSource>();

            // To data contract
            Mapper.CreateMap<FacetSource, DC.FacetSource>();


        }


    }
}