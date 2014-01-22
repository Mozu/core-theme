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
            Mapper.CreateMap<DC.CustomerContact, CustomerContact>()
                // explicitly perform base class mapping Mozu.Core.Api.Contracts.Contact <=> Contact
                .BeforeMap((dc, x) => { Mapper.Map<Mozu.Core.Api.Contracts.Contact, Contact>(dc, x); })
                .ForMember(x => x.AccountId, op => op.MapFrom(dc => dc.AccountId))
                .ForMember(x => x.FaxNumber, op => op.MapFrom(dc => dc.FaxNumber))
                .ForMember(x => x.IsShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING)))
                .ForMember(x => x.IsPrimaryShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING && dct.IsPrimary)))
                .ForMember(x => x.IsBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING)))
                .ForMember(x => x.IsPrimaryBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING && dct.IsPrimary)))
                ;

            Mapper.CreateMap<CustomerContact, DC.CustomerContact>()
                // explicitly perform base class mapping Contact <=> Mozu.Core.Api.Contracts.Contact
                .BeforeMap((x, dc) => { Mapper.Map<Contact, Mozu.Core.Api.Contracts.Contact>(x, dc); })
                .ForMember(dc => dc.AccountId, op => op.MapFrom(x => x.AccountId))
                .ForMember(dc => dc.FaxNumber, op => op.MapFrom(x => x.FaxNumber))
                .ForMember(dc => dc.Types, op => op.ResolveUsing(x => {
                    var types = new List<DC.ContactType>();
                    if (x.IsBilling)
                        types.Add(new DC.ContactType { Name = DC.ContactTypeConst.BILLING, IsPrimary = x.IsPrimaryBilling });
                    if (x.IsShipping)
                        types.Add(new DC.ContactType { Name = DC.ContactTypeConst.SHIPPING, IsPrimary = x.IsPrimaryShipping });

                    return types;
                }))
                ;

        }
    }
}
