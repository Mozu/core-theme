using System.Collections.Generic;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public static class InvitationMapping
    {
        public static void Configure()
        {
            Mapper.CreateMap<Invitation, AdminUser.Contracts.Invitation>()
                .ForMember(dest => dest.InvitationRoles,
                    opt => opt.ResolveUsing(src => src.Roles.ToAdminUserContract()))
                .ForMember(dc => dc.UserScopeType, op => op.Ignore())
                .ForMember(dc => dc.UserScopeId, op => op.Ignore())
                .ForMember(dc => dc.ScopeName, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                //.ForMember(dest => dest.Id, opt => opt.ResolveUsing(src => src.Id))
                ;

            Mapper.CreateMap<AdminUser.Contracts.Invitation, Invitation>()
                .ForMember(dest => dest.Roles,
                    opt => opt.ResolveUsing(src => src.InvitationRoles.ToSiteBuilderContract()))
                .ForMember(x => x.SiteId, op => op.Ignore())
                .ForMember(x => x.TenantId, op => op.Ignore())                                
                //.ForMember(dest=>dest.DateLastSent, opt=>opt.ResolveUsing(src=>src.DateLastSent))
                ;
        }

        public static Invitation ToSiteBuilderContract(this AdminUser.Contracts.Invitation invitation)
        {
            return Mapper.Map<AdminUser.Contracts.Invitation, Invitation>(invitation);
        }

        public static AdminUser.Contracts.Invitation ToAdminUserContract(this Invitation invitation)
        {
            return Mapper.Map<Invitation, AdminUser.Contracts.Invitation>(invitation);
        }

        public static List<Invitation> ToSiteBuilderContract(this List<AdminUser.Contracts.Invitation> invitations)
        {
            return Mapper.Map<List<Mozu.AdminUser.Contracts.Invitation>, List<Invitation>>(invitations);
        }

        public static List<AdminUser.Contracts.Invitation> ToAdminUserContract(this List<Invitation> invitations)
        {
            return Mapper.Map<List<Invitation>, List<AdminUser.Contracts.Invitation>>(invitations);
        }
    }
}