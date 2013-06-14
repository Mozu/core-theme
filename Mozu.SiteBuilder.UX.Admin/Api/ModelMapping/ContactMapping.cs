using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ContactMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.Contact, Contact>()
            .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
            .ForMember(x => x.Email, op => op.MapFrom(dc => dc.Email))
            .ForMember(x => x.FirstName, op => op.MapFrom(dc => dc.FirstName))
            .ForMember(x => x.MiddleName, op => op.MapFrom(dc => dc.MiddleNameOrInitial))
            .ForMember(x => x.LastName, op => op.MapFrom(dc => dc.LastNameOrSurname))
            .ForMember(x => x.CompanyOrOrganization, op => op.MapFrom(dc => dc.CompanyOrOrganization))
            .ForMember(x => x.Address1, op => op.MapFrom(dc => dc.Address != null ? dc.Address.Address1 : null))
            .ForMember(x => x.Address2, op => op.MapFrom(dc => dc.Address != null ? dc.Address.Address2 : null))
            .ForMember(x => x.Address3, op => op.MapFrom(dc => dc.Address != null ? dc.Address.Address3 : null))
            .ForMember(x => x.Address4, op => op.MapFrom(dc => dc.Address != null ? dc.Address.Address4 : null))
            .ForMember(x => x.CityOrTown, op => op.MapFrom(dc => dc.Address != null ? dc.Address.CityOrTown : null))
            .ForMember(x => x.CountryCode, op => op.MapFrom(dc => dc.Address != null ? dc.Address.CountryCode : null))
            .ForMember(x => x.PostalOrZipCode, op => op.MapFrom(dc => dc.Address != null ? dc.Address.PostalOrZipCode : null))
            .ForMember(x => x.StateOrProvince, op => op.MapFrom(dc => dc.Address != null ? dc.Address.StateOrProvince : null))
            .ForMember(x => x.HomePhone, op => op.MapFrom(dc => dc.PhoneNumbers != null ? dc.PhoneNumbers.Home : null))
            .ForMember(x => x.WorkPhone, op => op.MapFrom(dc => dc.PhoneNumbers != null ? dc.PhoneNumbers.Work : null))
            .ForMember(x => x.MobilePhone, op => op.MapFrom(dc => dc.PhoneNumbers != null ? dc.PhoneNumbers.Mobile : null))
            ;
        }
    }
}
