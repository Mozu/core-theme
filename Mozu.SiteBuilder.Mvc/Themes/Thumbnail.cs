using System;
using System.IO;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    public class Thumbnail
    {
        /// <summary>
        /// Contains the original filename of this thumbnail.
        /// </summary>
        public string Name { get; private set; }

        ///// <summary>
        ///// Contains the file data for this thumbnail.
        ///// </summary>
        //public byte[] Contents { get; private set; }

        /// <summary>
        /// Contains the file extension of this thumbnail.
        /// Example: ".jpg"
        /// </summary>
        string Extension { get { return Path.GetExtension(Name); } }

        /// <summary>
        /// Returns the thumbnail as a data uri.
        /// See http://en.wikipedia.org/wiki/Data_URI_scheme
        /// Example: "data:image/jpeg;base64,..."
        /// </summary>
        //public string AsDataUri
        //{
        //    get
        //    {
        //        if (Contents == null || String.IsNullOrEmpty(Extension))
        //            return null;
        //        else
        //            return "data:image/" + Extension.Replace(".", "") + ";charset=utf-8;base64," + Convert.ToBase64String(Contents);
        //    }
        //}
        public string FullPath { get; set; }


        /// <summary>
        /// Public constructor.
        /// </summary>
        public Thumbnail(string name , string fullPath )
        {
            Name = name;
            FullPath = fullPath;
            //Contents = data;
        }
    }
}
