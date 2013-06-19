using System;
using System.Linq;
using AutoMapper;
using DC = Mozu.Customer.Contracts;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CustomerMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.CustomerAccount, ApiCustomer>()
            .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
            .ForMember(x => x.SiteId, op => op.MapFrom(dc => dc.SiteId))
            .ForMember(x => x.Contacts, op => op.MapFrom(dc => dc.Contacts))
            .ForMember(x => x.CompanyOrOrganization, op => op.MapFrom(dc => dc.CompanyOrOrganization))
            .ForMember(x => x.AcceptsMarketing, op => op.MapFrom(dc => dc.AcceptsMarketing))
            .ForMember(x => x.Groups, op => op.MapFrom(dc => (dc.Groups ?? Enumerable.Empty<DC.CustomerGroup>()).Select(g => g.Name)))
            .ForMember(x => x.Notes, op => op.MapFrom(dc => dc.Notes))
            .ForMember(x => x.TotalOrderAmount, op => op.MapFrom(dc => dc.OrderSummary != null && dc.OrderSummary.TotalOrderAmount != null ? (decimal?)dc.OrderSummary.TotalOrderAmount.Amount : null))
            .ForMember(x => x.OrderCount, op => op.MapFrom(dc => dc.OrderSummary != null ? dc.OrderSummary.OrderCount : 0))
            .ForMember(x => x.LastOrderDate, op => op.MapFrom(dc => dc.OrderSummary != null ? dc.OrderSummary.LastOrderDate : null))
            ;
        }
    }
}