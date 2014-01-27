using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.FSharp.Collections;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class FSharpExtensions
    {
        public static FSharpList<T> ToFSharpList<T>(this IEnumerable<T> iEnumerable)
        {
           return ListModule.OfSeq(iEnumerable);
        }



    

    }
}
