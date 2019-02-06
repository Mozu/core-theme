using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.Customer.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CustomerContactMapping : Profile
    {
        public CustomerContactMapping()
        {
            CreateMap<DC.CustomerContact, CustomerContact>()
                // explicitly perform base class mapping Mozu.Core.Api.Contracts.Contact <=> Contact
                .IncludeBase<Core.Api.Contracts.Contact, Contact>()
                .ForMember(x => x.AccountId, op => op.ResolveUsing(dc => dc.AccountId))
                .ForMember(x => x.FaxNumber, op => op.ResolveUsing(dc => dc.FaxNumber))
                .ForMember(x => x.IsShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING)))
                .ForMember(x => x.IsPrimaryShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING && dct.IsPrimary)))
                .ForMember(x => x.IsBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING)))
                .ForMember(x => x.IsPrimaryBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING && dct.IsPrimary)))
                ;

            CreateMap<CustomerContact, DC.CustomerContact>()
                // explicitly perform base class mapping Contact <=> Mozu.Core.Api.Contracts.Contact
                .IncludeBase<Contact, Core.Api.Contracts.Contact>()
                .ForMember(dc => dc.AccountId, op => op.ResolveUsing(x => x.AccountId))
                .ForMember(dc => dc.FaxNumber, op => op.ResolveUsing(x => x.FaxNumber))
                .ForMember(dc => dc.Types, op => op.ResolveUsing(x =>
                {
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
