using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

using System.Reflection;
namespace Mozu.SiteBuilder.UX.Models
{
   


    public interface ICmsMetaDataExtrator
    {
        Dictionary<string,object> GetCmsModelMetadata(string expression );

    }
    
}

