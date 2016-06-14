using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    public class CustomerPoTransactionsCsvFileResult: Mozu.SiteBuilder.Mvc.ActionResults.FileResult
    {
        public CustomerPoTransactionsCsvFileResult(string contentType) : base(contentType)
        {
        }

        public List<CustomerPurchaseOrderTransaction> CustomerPurchaseOrderTransactions { get; set; }
        
        protected override void WriteFile(HttpResponseBase response)
        {
            var sw = response.Output;
            sw.WriteLine("Date,Site,OrderNumber,OrderType,PoNumber,Author,TransactionDetails,Amount,Balance");
            EnumerableExtensions.Each(CustomerPurchaseOrderTransactions, x =>
            {
                /*var date = x.TransactionDate.ToString("G").Replace("\"", "\"\""); //Select(y => $"\"{y?.Replace("\"", "\"\"")}\"");
                sw.Write($"\"{date}\"");*/
                EscapeWrite(sw, x.TransactionDate.ToString("G"));
                sw.Write(',');
                EscapeWrite(sw, x.SiteId.ToString());
                sw.Write(',');
                sw.Write(x.OrderNumber);
                sw.Write(',');
                sw.Write(x.OrderType);
                sw.Write(',');
                EscapeWrite(sw, x.PurchaseOrderNumber ?? "");
                sw.Write(',');
                EscapeWrite(sw, x.Author ?? "");
                sw.Write(',');
                EscapeWrite(sw, x.TransactionDescription ?? "") ;
                sw.Write(',');
                sw.Write(x.TransactionAmount);
                sw.Write(',');
                sw.Write(x.AvailableBalance);
                sw.WriteLine();
            });
        }

        protected override Task WriteFileAsync(HttpResponseBase response)
        {
            WriteFile(response);
            return Task.FromResult<bool>(true);
        }

        static void EscapeWrite(TextWriter sw, string inSTr)
        {
            if (inSTr.IndexOf('\"') > -1)
            {
                sw.Write('\"');
                sw.Write(inSTr.Replace("\"", "\"\""));
                sw.Write('\"');


            }
            else if (inSTr.IndexOf('\"') > -1 || inSTr.IndexOf(',') > -1)
            {
                sw.Write('\"');
                sw.Write(inSTr);
                sw.Write('\"');

            }
            else
            {
                sw.Write(inSTr);
            }

        }
    }
}