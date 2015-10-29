using System;
using System.Collections.Generic;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.FileManagement;
using System.Linq;
using System.Web;
using AutoMapper;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class FileManagementModelMapping: Profile
    {
        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Document, FileManagementFile>()
                .ForMember(x => x.dateModified, op => op.ResolveUsing(x => x.UpdateDate))
                .ForMember(x => x.fileType, op => op.ResolveUsing((Document x) => DeriveMimeType(x.ContentMimeType)))
                .ForMember(x => x.id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.name, op => op.ResolveUsing(x => x.Name))
                .ForMember(x => x.tags, op => op.ResolveUsing(_ => _.Get<string[]>("tags")))
                .ForMember(x => x.isUploaded, op => op.ResolveUsing(x => x.ContentLength.GetValueOrDefault(0) > 0))
                .ForMember(x => x.width, op => op.ResolveUsing(_ => _.Get<double>("width")))
                .ForMember(x => x.height, op => op.ResolveUsing(_ => _.Get<double>("height")))
                .ForMember(x => x.fileSize, op => op.ResolveUsing(x => x.ContentLength.GetValueOrDefault(0)));

            Mapper.CreateMap<FolderTree, FileManagementFolder>()
                .ForMember(x => x.id, op => op.ResolveUsing(x => (x.Folder != null) ? x.Folder.Id : null))
                .ForMember(x => x.name, op => op.ResolveUsing(x => (x.Folder != null) ? x.Folder.Name : null))
                .ForMember(x => x.parentId , op => op.ResolveUsing(x => (x.Folder != null) ? x.Folder.ParentId : null))
                .ForMember(x => x.leaf, op=> op.UseValue ( false ))// op => op.ResolveUsing(x => x.Children == null || x.Children.Count == 0))
                .ForMember(x => x.items, op => op.ResolveUsing(x => x.Children))
                .ForMember(x => x.expanded, op => op.Ignore())
                ;

            Mapper.CreateMap<Folder, FileManagementFolder>()
                .ForMember(x => x.id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.name, op => op.ResolveUsing(x => x.Name))
                .ForMember(x => x.parentId, op => op.ResolveUsing(x => x.ParentId))
                .ForMember(x => x.leaf, op => op.Ignore())
                .ForMember(x => x.items, op => op.Ignore())
                .ForMember(x => x.expanded, op => op.Ignore())
                ;
        }

        string DeriveMimeType(string contentMimeType)
        {
            if (contentMimeType.IsNullOrEmpty()) return "Unknown";
            else if (contentMimeType.EndsWith("octet-stream", StringComparison.OrdinalIgnoreCase)) return "Binary";
            var slashindex = contentMimeType.IndexOf('/');
            if(slashindex == -1 || slashindex + 1 == contentMimeType.Length) return "Unknown"; // if the '/' is at the end of the string or not there at all
            else return contentMimeType.Substring(slashindex + 1);
        }
    }
}