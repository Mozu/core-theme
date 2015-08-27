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
               // .ForMember(x => x.folderId, op => op.ResolveUsing(x => x.FolderId))
                .ForMember(x => x.fileType, op => op.ResolveUsing(x => x.Extension))
                .ForMember(x => x.id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.name, op => op.ResolveUsing(x => x.Name))
                .ForMember(x => x.tags, op => op.ResolveUsing(_ => _.Get<string[]>("tags")))

                //.ForMember(x => x.thumbnail, op => op.ResolveUsing(DoThumb))
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
                //ignore
                .ForMember(x => x.leaf, op => op.Ignore())
                .ForMember(x => x.items, op => op.Ignore())
                .ForMember(x => x.expanded, op => op.Ignore())
                ;
               // .ForMember(x => x.leaf, op => op.ResolveUsing(x => x.Children == null || x.Children.Count == 0))
               // .ForMember(x => x.items, op => op.ResolveUsing(x => x.Children));

                
        }
        //static string DoDate(Document doc)
        //{
        //    var dd = doc.InsertDate.Value;
        //    var now = DateTime.Now;

        //    if (dd.Date == now.Date)
        //    {
        //        return "Today";
        //    }
        //    return dd.ToLongDateString();

        //}
        //const long MB = 1048576;
        //const long KB = 1024;
        //static string DoFileSize( Document doc )
        //{
        //    long size = doc.ContentSummary != null ? doc.ContentSummary.Length.Value  : 0;
        //    if (size >= MB)
        //    {
        //        return Math.Round( (decimal)size/(decimal)MB, 1) + " MB";
                 
        //    }
        //     return Math.Round( (decimal)size/(decimal)KB, 1) + " KB";
            
            
        //}
        //static string DoThumb(Document doc)
        //{
        //    switch ((doc.Extension ?? "").ToLower())
        //    {
        //        case "gif":
        //        case "jpg":
        //        case "jpeg":
        //        case "png": {
        //            if (doc.ContentLength .GetValueOrDefault (0) < 1)
        //            {
        //                return "/admin/Scripts/resources/images/legacy/AddPhotos.png";
        //            }
        //            return "/admin/img/files/" + doc.Id;
        //        }
        //    }
        //    return "/admin/Scripts/resources/images/file-icon.png";

            
        //}
    }
}