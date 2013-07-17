using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{

    [DataContract]
    public class CartAbstract : ModelBase
    {
         [DataMember(Name = "itemCount")]
        public int? ItemCount { get; set; }

         [DataMember(Name = "exists")]
        public bool? Exists { get; set; }

                 [DataMember(Name = "total")]

         public decimal Total { get; set; }
    }



    
}
