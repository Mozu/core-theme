using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Magnum.Extensions;
using MR = Mozu.SiteBuilder.UX.Models.Users;
using SB = Mozu.SiteBuilder.UX.Models.Customers;
using AC = Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using CS = Mozu.Customer.Contracts;
using AP = Mozu.Core.Api.Contracts;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    //todo: Greg Murray on 2014-01-27 is this still needed?
    public class OldCustomerMapping : Profile
    {
        public OldCustomerMapping()
        {
            CreateMap<CS.CustomerAccount, SB.CustomerAccount>();
            CreateMap<SB.CustomerAccount, CS.CustomerAccount>();

            CreateMap<CS.CustomerContact, SB.CustomerAccountContact>();
            CreateMap<SB.CustomerAccountContact, CS.CustomerContact>();

            CreateMap<CS.CustomerNote, SB.CustomerAccountNote>();
            CreateMap<SB.CustomerAccountNote, CS.CustomerNote>();

            CreateMap<AP.Contact, SB.Contact>();
            CreateMap<SB.Contact, AP.Contact>();

            CreateMap<SB.CurrencyAmount, CS.CurrencyAmount>();
            CreateMap<CS.CurrencyAmount, SB.CurrencyAmount>();

            CreateMap<SB.Phone, AP.Phone>();
            CreateMap<AP.Phone, SB.Phone>();

            CreateMap<SB.CommerceSummary, CS.CommerceSummary>();
            CreateMap<CS.CommerceSummary, SB.CommerceSummary>();

            CreateMap<SB.Address, AP.Address>();
            CreateMap<AP.Address, SB.Address>();

            //CreateMap<US.PasswordInfo, AC.PasswordInfo>();
            //CreateMap<AC.PasswordInfo, US.PasswordInfo>();

          //  CreateMap<AC.AccountInformation, US.PasswordInfo>();

            CreateMap<AP.User, AC.AccountInformation>()
                .ForMember(x => x.Email, m => m.ResolveUsing(x => x.EmailAddress));

            CreateMap<AP.User, AC.User>();
            CreateMap<AC.User, AP.User>();

            CreateMap<AP.User, AC.LoginUser >();
            CreateMap<AC.LoginUser, AP.User>();

            //CreateMap<AC.Invitation, US.Invitation>();
            //CreateMap<US.Invitation, AC.Invitation>();
            CreateMap<AP.UserRole, AC.AccountUserRole>();
            CreateMap<AC.Invitation, AC.AccountUser>()
                .ForMember(x => x.Activity, m => m.ResolveUsing(x => x.State))
                .ForMember(x => x.Email, m => m.ResolveUsing(x => x.EmailAddress))
                /*.ForMember( x=> x.Roles , m => m.ResolveUsing( x=> new List<AC.AccountUserRole >(){ new AC.AccountUserRole()
                                                                                                        {
                                                                                                            RoleId =x.RoleId ,
                                                                                                            RoleName = x.Role 
                                                                                                        }}))*/
                .ForMember(x => x.Type, m => m.ResolveUsing((AC.Invitation x) => x.GetType().Name.ToLowerInvariant()))
                ;
            CreateMap<AP.User, AC.AccountUser>()
                .ForMember( x=> x.Roles , m=> m.ResolveUsing(x=> x.Roles ))
               
                .ForMember(x => x.Type, m => m.ResolveUsing((AP.User x) => x.GetType().Name.ToLowerInvariant()))
                .ForMember(x => x.Activity, m => m.ResolveUsing(x =>
                {
                    var data = x.SystemData;
                    if (data != null && data.LastLoginOn.HasValue)
                        return data.LastLoginOn.Value.ToString() + " UTC";
                    return "";
                }))
                .ForMember(x => x.Email, m => m.ResolveUsing(x => x.EmailAddress));

            CreateMap<AC.UserSystemData, AP.UserSystemData>();
            CreateMap<AP.UserSystemData, AC.UserSystemData>();

            // TODO: Consider renaming, this will probably be confusing at some point
       //     CreateMap<CS.CustomerGroup, SB.CustomerGroup>();
        //    CreateMap<SB.CustomerGroup, CS.CustomerGroup>();
        }
    }
}