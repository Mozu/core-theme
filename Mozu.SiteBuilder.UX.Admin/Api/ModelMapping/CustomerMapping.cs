using System;
using System.Linq;
using AutoMapper;
using MR = Mozu.SiteBuilder.UX.Models.Users;
using SB = Mozu.SiteBuilder.UX.Models.Customers;
using AC = Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using CS = Mozu.Customer.Contracts;
using AP = Mozu.Core.Api.Contracts;
using US = Mozu.User.Contracts;

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
            Mapper.CreateMap<CS.CustomerAccount, SB.CustomerAccount>();
            Mapper.CreateMap<SB.CustomerAccount, CS.CustomerAccount>();

            Mapper.CreateMap<CS.CustomerContact, SB.CustomerAccountContact>();
            Mapper.CreateMap<SB.CustomerAccountContact, CS.CustomerContact>();

            Mapper.CreateMap<CS.CustomerNote, SB.CustomerAccountNote>();
            Mapper.CreateMap<SB.CustomerAccountNote, CS.CustomerNote>();

            Mapper.CreateMap<AP.Contact, SB.Contact>();
            Mapper.CreateMap<SB.Contact, AP.Contact>();

            Mapper.CreateMap<SB.CurrencyAmount, CS.CurrencyAmount>();
            Mapper.CreateMap<CS.CurrencyAmount, SB.CurrencyAmount>();

            Mapper.CreateMap<SB.Phone, AP.Phone>();
            Mapper.CreateMap<AP.Phone, SB.Phone>();

            Mapper.CreateMap<SB.OrderSummary, CS.OrderSummary>();
            Mapper.CreateMap<CS.OrderSummary, SB.OrderSummary>();

            Mapper.CreateMap<SB.Address, AP.Address>();
            Mapper.CreateMap<AP.Address, SB.Address>();

            Mapper.CreateMap<US.PasswordInfo, AC.PasswordInfo>();
            Mapper.CreateMap<AC.PasswordInfo, US.PasswordInfo>();

            Mapper.CreateMap<AC.AccountInformation, US.PasswordInfo>();

            Mapper.CreateMap<AP.User, AC.AccountInformation>()
                .ForMember(x => x.Email, m => m.MapFrom(x => x.EmailAddress));

            Mapper.CreateMap<AP.User, AC.User>();
            Mapper.CreateMap<AC.User, AP.User>();

            Mapper.CreateMap<AP.User, AC.LoginUser >();
            Mapper.CreateMap<AC.LoginUser, AP.User>();

            Mapper.CreateMap<AC.Invitation, US.Invitation>();
            Mapper.CreateMap<US.Invitation, AC.Invitation>();

            Mapper.CreateMap<AC.Invitation, AC.AccountUser>()
                .ForMember(x => x.Activity, m => m.ResolveUsing(x => x.State))
                .ForMember(x => x.Email, m => m.ResolveUsing(x => x.EmailAddress))
                .ForMember(x => x.Type, m => m.ResolveUsing(x => x.GetType().Name.ToLowerInvariant()))
                ;
            Mapper.CreateMap<AP.User, AC.AccountUser>()
                .ForMember(x => x.RoleId, m => m.ResolveUsing(x => x.Roles == null || x.Roles.Count()==0 ? -1: x.Roles.Select( _=> _.RoleId ).FirstOrDefault( )))
                .ForMember(x => x.Role, m => m.ResolveUsing(x => x.Roles == null || x.Roles.Count()==0 ? "n/a" :x.Roles.Select( _=> _.RoleName  ).FirstOrDefault( )))
                .ForMember(x => x.Type, m => m.ResolveUsing(x => x.GetType().Name.ToLowerInvariant()))
                .ForMember(x => x.Activity, m => m.ResolveUsing(x =>
                {
                    var data = x.SystemData;
                    if (data != null && data.LastLoginOn.HasValue)
                        return "Last Login " + data.LastLoginOn.ToString();
                    return "";
                }))
                .ForMember(x => x.Email, m => m.ResolveUsing(x => x.EmailAddress));

            Mapper.CreateMap<AC.UserSystemData, AP.UserSystemData>();
            Mapper.CreateMap<AP.UserSystemData, AC.UserSystemData>();

            // TODO: Consider renaming, this will probably be confusing at some point
            Mapper.CreateMap<CS.CustomerGroup, SB.CustomerGroup>();
            Mapper.CreateMap<SB.CustomerGroup, CS.CustomerGroup>();
        }
    }
}