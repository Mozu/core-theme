using System.Collections.Generic;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public static class InvitationRoleMapping
    {
        public static void Configure()
        {
            Mapper.CreateMap<AccountUserRole, AdminUser.Contracts.InvitationRole>()
                .ForMember(dest => dest.Name,
                    opt => opt.ResolveUsing(src => src.RoleName))
                ;

            Mapper.CreateMap<Mozu.AdminUser.Contracts.InvitationRole, AccountUserRole>()
                .ForMember(dest => dest.RoleName,
                    opt => opt.ResolveUsing(src => src.Name))
                ;
        }

        public static AccountUserRole ToSiteBuilderContract(this Mozu.AdminUser.Contracts.InvitationRole invitationRole)
        {
            return Mapper.Map<Mozu.AdminUser.Contracts.InvitationRole, AccountUserRole>(invitationRole);
        }

        public static Mozu.AdminUser.Contracts.InvitationRole ToAdminUserContract(this AccountUserRole invitationRole)
        {
            return Mapper.Map<AccountUserRole, Mozu.AdminUser.Contracts.InvitationRole>(invitationRole);
        }

        public static List<AccountUserRole> ToSiteBuilderContract(this List<Mozu.AdminUser.Contracts.InvitationRole> invitationRoles)
        {
            return Mapper.Map<List<Mozu.AdminUser.Contracts.InvitationRole>, List<AccountUserRole>>(invitationRoles);
        }

        public static List<Mozu.AdminUser.Contracts.InvitationRole> ToAdminUserContract(this List<AccountUserRole> invitationRoles)
        {
            return Mapper.Map<List<AccountUserRole>, List<Mozu.AdminUser.Contracts.InvitationRole>>(invitationRoles);
        }
    }
}