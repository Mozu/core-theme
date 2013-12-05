using System;
using System.Linq;
using AutoMapper;
using DC = Mozu.Customer.Contracts.Credit;
using Credit = Mozu.SiteBuilder.UX.Admin.Api.Models.Credit;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CreditMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.Credit, Credit>()
            ;

            Mapper.CreateMap<Credit, DC.Credit>()
            ;
        }
    }
}