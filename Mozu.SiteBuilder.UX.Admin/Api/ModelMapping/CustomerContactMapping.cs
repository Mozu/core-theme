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
                .ForMember(x => x.AccountId, op => op.ResolveUsing(dc => dc.AccountId))
                .ForMember(x => x.FaxNumber, op => op.ResolveUsing(dc => dc.FaxNumber))
                .ForMember(x => x.IsShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING)))
                .ForMember(x => x.IsPrimaryShipping, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.SHIPPING && dct.IsPrimary)))
                .ForMember(x => x.IsBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING)))
                .ForMember(x => x.IsPrimaryBilling, op => op.ResolveUsing(dc => dc.Types.Any(dct => dct.Name == DC.ContactTypeConst.BILLING && dct.IsPrimary)))

                // base class maps AddressType. DO NOT let automapper overwrite it.
                .ForMember(x => x.AddressType, op => op.Ignore())

                // ignore a bunch of other members that base class maps, but unit test fails on
                .ForMember(x => x.MiddleName, op => op.Ignore())
                .ForMember(x => x.LastName, op => op.Ignore())
                .ForMember(x => x.Address1, op => op.Ignore())
                .ForMember(x => x.Address2, op => op.Ignore())
                .ForMember(x => x.Address3, op => op.Ignore())
                .ForMember(x => x.Address4, op => op.Ignore())
                .ForMember(x => x.CityOrTown, op => op.Ignore())
                .ForMember(x => x.StateOrProvince, op => op.Ignore())
                .ForMember(x => x.CountryCode, op => op.Ignore())
                .ForMember(x => x.PostalOrZipCode, op => op.Ignore())
                .ForMember(x => x.HomePhone, op => op.Ignore())
                .ForMember(x => x.MobilePhone, op => op.Ignore())
                .ForMember(x => x.WorkPhone, op => op.Ignore())
                ;

            Mapper.CreateMap<CustomerContact, DC.CustomerContact>()
                // explicitly perform base class mapping Contact <=> Mozu.Core.Api.Contracts.Contact
                .BeforeMap((x, dc) => { Mapper.Map<Contact, Mozu.Core.Api.Contracts.Contact>(x, dc); })
                .ForMember(dc => dc.AccountId, op => op.ResolveUsing(x => x.AccountId))
                .ForMember(dc => dc.FaxNumber, op => op.ResolveUsing(x => x.FaxNumber))
                .ForMember(dc => dc.Types, op => op.ResolveUsing(x => {
                    var types = new List<DC.ContactType>();
                    if (x.IsPrimaryBilling)
                        types.Add(new DC.ContactType { Name = DC.ContactTypeConst.BILLING, IsPrimary = x.IsPrimaryBilling });
                    if (x.IsPrimaryShipping)
                        types.Add(new DC.ContactType { Name = DC.ContactTypeConst.SHIPPING, IsPrimary = x.IsPrimaryShipping });

                    return types;
                }))

                // have to ignore the following members for unit tests to pass even though they are mapped by .BeforeMap
                .ForMember(dc => dc.PhoneNumbers, op => op.Ignore())
                .ForMember(dc => dc.MiddleNameOrInitial, op => op.Ignore())
                .ForMember(dc => dc.LastNameOrSurname, op => op.Ignore())
                .ForMember(dc => dc.Address, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.Label, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26
                ;

        }
    }
}
