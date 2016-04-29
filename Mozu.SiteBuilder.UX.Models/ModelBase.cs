// -----------------------------------------------------------------------
// <copyright file="ModelBase.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Mozu.SiteBuilder.UX.Models.ModelMetaData;



namespace Mozu.SiteBuilder.UX.Models
{


    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Linq.Expressions;

    using System.Runtime.Serialization;
    /// <summary>
    /// TODO: Update summary.
    /// </summary>


    public interface ITagFilterFindable
    {
        object Filter(IEnumerable<object> parameter);
    }

    [DataContract]
    public abstract class ModelBase 
    {

       

        
    }
  

    
}
