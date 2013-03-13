using System;
using System.Collections.Generic;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.FileManagement;
using System.Linq;
using System.Web;
using AutoMapper;

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
                .ForMember(x => x.dateModified, op => op.MapFrom(x => x.UpdateDate))
                .ForMember(x => x.folderId, op => op.MapFrom(x => x.FolderId))
                .ForMember(x => x.fileType, op => op.MapFrom(x => x.Extension))
                .ForMember(x => x.id, op => op.MapFrom(x => x.Id))
                .ForMember(x => x.name, op => op.MapFrom(x => x.Name))
                .ForMember(x => x.thumbnail, op => op.ResolveUsing(DoThumb))
                .ForMember(x => x.isUploaded, op => op.ResolveUsing(x => x.ContentLength.GetValueOrDefault(0) > 0))
                .ForMember(x => x.width  , op=> op.ResolveUsing (_ => _.Properties.Where (_p => _p.PropertyType == "width").Select(_p=> (long)_p.Value).FirstOrDefault ()))
                .ForMember(x => x.height, op => op.ResolveUsing(_ => _.Properties.Where(_p => _p.PropertyType == "height").Select(_p => (long)_p.Value).FirstOrDefault()))
                .ForMember(x => x.fileSize, op => op.MapFrom(x => x.ContentLength.GetValueOrDefault(0)));

            Mapper.CreateMap<FolderTree, FileManagementFolder>()

                .ForMember(x => x.id, op => op.MapFrom(x => x.Folder.Id))
                .ForMember(x => x.name, op => op.MapFrom(x => x.Folder.Name))
                .ForMember(x => x.parentId , op => op.MapFrom(x => x.Folder.ParentId ))
                .ForMember(x => x.leaf, op=> op.UseValue ( false ))// op => op.MapFrom(x => x.Children == null || x.Children.Count == 0))
                .ForMember(x => x.items, op => op.MapFrom(x => x.Children));

            Mapper.CreateMap<Folder, FileManagementFolder>()

                .ForMember(x => x.id, op => op.MapFrom(x => x.Id))
                .ForMember(x => x.name, op => op.MapFrom(x => x.Name))
                .ForMember(x => x.parentId, op => op.MapFrom(x => x.ParentId));
               // .ForMember(x => x.leaf, op => op.MapFrom(x => x.Children == null || x.Children.Count == 0))
               // .ForMember(x => x.items, op => op.MapFrom(x => x.Children));

                
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
        static string DoThumb(Document doc)
        {
            switch ((doc.Extension ?? "").ToLower())
            {
                case "gif":
                case "jpg":
                case "jpeg":
                case "png": {
                    if (doc.ContentLength .GetValueOrDefault (0) < 1)
                    {
                        return "/admin/Scripts/resources/images/legacy/AddPhotos.png";
                    }
                    return "/admin/img/files/" + doc.Id;
                }
            }
            return "/admin/Scripts/resources/images/file-icon.png";

            
        }
    }
}