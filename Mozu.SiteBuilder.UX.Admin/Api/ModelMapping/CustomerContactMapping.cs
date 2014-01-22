using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.Customer.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CustomerContactMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            // 
            Mapper.CreateMap<DC.CustomerContact, CustomerContact>()
                // explicitly perform base class mapping Mozu.Core.Api.Contracts.Contact <=> Contact
                .BeforeMap((x, dc) => { Mapper.Map<Mozu.Core.Api.Contracts.Contact, Contact>(x, dc); })
                .ForMember(x => x.AccountId, op => op.MapFrom(dc => dc.AccountId))
                .ForMember(x => x.FaxNumber, op => op.MapFrom(dc => dc.FaxNumber))
                .ForMember(x => x.IsShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING)))
                .ForMember(x => x.IsPrimaryShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING && dct.IsPrimary)))
                .ForMember(x => x.IsBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING)))
                .ForMember(x => x.IsPrimaryBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING && dct.IsPrimary)))
                
                ;
        }
    }
}
