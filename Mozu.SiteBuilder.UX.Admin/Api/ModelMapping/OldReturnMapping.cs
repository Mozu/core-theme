using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using CustomerDC = Mozu.Customer.Contracts;
using DiscountDC = Mozu.CommerceRuntime.Contracts.Discounts;
using OrdersDC = Mozu.CommerceRuntime.Contracts.Orders;
using ReturnsDC = Mozu.CommerceRuntime.Contracts.Returns;
using PaymentsDC = Mozu.CommerceRuntime.Contracts.Payments;
using ProductsDC = Mozu.CommerceRuntime.Contracts.Products;
using ShippingDC = Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class OldReturnMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<ReturnsDC.Return, OldReturn>()
                  .ForMember(x => x.CreateDate, opt => opt.ResolveUsing(x => (x.AuditInfo != null) 
                      ? x.AuditInfo.CreateDate : null))
                  .ForMember(x => x.UpdateDate, opt => opt.ResolveUsing(x =>(x.AuditInfo != null) 
                      ? x.AuditInfo.UpdateDate : null))
                  .ForMember(x => x.RmaNote, op => op.ResolveUsing(dc => (dc.Notes != null && dc.Notes.Any() ) 
                      ? dc.Notes.First().Text 
                      : string.Empty))
                  //ignores
                  //todo: confirm should total loss = sum(prod,tax,ship losses)? Greg Murray on 2014-01-24
                  .ForMember(x => x.TotalLossAmount, op => op.Ignore())
                  //only site & tenant in DC.
                  .ForMember(x => x.MasterCatalogId, op => op.Ignore())
                  ;
         
            Mapper.CreateMap<ReturnsDC.ReturnItem, OldReturnItem>()
                  .ForMember(x => x.Reason, opt => opt.ResolveUsing(x => x.Reasons == null 
                      ? null : x.Reasons.Select(_ => _.Reason).FirstOrDefault()))                
                  //todo: confirm new ProductCode mapping Greg Murray on 2014-01-24 
                  .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => (dc.Product != null) 
                      ? dc.Product.ProductCode : null))
                  .ForMember(x => x.RmaNote, op => op.ResolveUsing(dc => (dc.Notes != null && dc.Notes.Any()) 
                      ? dc.Notes.First().Text 
                      : string.Empty))
                  //ignores
                  .ForMember(x => x.ParentItemId, op => op.Ignore())
                  .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Reasons.Sum(r => r.Quantity)))
                  ;
          
           // Mapper.CreateMap<ReturnsDC.ReturnUnitPrice, ReturnUnitPrice>();
            Mapper.CreateMap<OrdersDC.OrderNote, OrderNote>()
                //todo: confirm new AuditInfo mapping Greg Murray on 2014-01-24 
                .ForMember(x => x.UpdateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.UpdateDate : null))
                .ForMember(x => x.UpdateBy, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.UpdateBy : null))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.CreateBy : null))
                ;


            Mapper.CreateMap<OldReturnAction, ReturnsDC.ReturnAction>();

            Mapper.CreateMap<OldReturn, ReturnsDC.Return>()
                  .ForMember(dc => dc.Items, op => op.ResolveUsing(retur => {
                      var returnBundles = 
                          from r in retur.Items
                          where !String.IsNullOrEmpty(r.ParentItemId)
                          group r by r.ParentItemId into g
                          select new ReturnsDC.ReturnItem {
                              OrderItemId = g.Key,
                              BundledProducts = g.Select(ri => new ReturnsDC.ReturnBundle { ProductCode = ri.ProductCode, Quantity = ri.Quantity }).ToList(),
                              Reasons = new List<ReturnsDC.ReturnReason> { new ReturnsDC.ReturnReason { Reason = g.First().Reason, Quantity = g.Sum(ri => ri.Quantity) } },
                              Notes = string.IsNullOrEmpty(g.First().RmaNote)
                                    ? new List<OrdersDC.OrderNote>()
                                    : new List<OrdersDC.OrderNote> { new OrdersDC.OrderNote { Text = g.First().RmaNote } }
                          };

                      var returnVanillaProducts =
                          from r in retur.Items
                          where String.IsNullOrEmpty(r.ParentItemId)
                          select Mapper.Map<OldReturnItem, ReturnsDC.ReturnItem>(r, new ReturnsDC.ReturnItem {
                              OrderItemId = r.OrderItemId,
                              Reasons = new List<ReturnsDC.ReturnReason> {
                                  new ReturnsDC.ReturnReason { Reason = r.Reason, Quantity = r.Quantity } 
                              },
                              Notes = string.IsNullOrEmpty(r.RmaNote)
                                    ? new List<OrdersDC.OrderNote>()
                                    : new List<OrdersDC.OrderNote> { new OrdersDC.OrderNote { Text = r.RmaNote } }
                          });

                      return returnBundles.Concat(returnVanillaProducts).ToList();
                  }))
                .ForMember(dc => dc.Notes, op => op.ResolveUsing(x => string.IsNullOrEmpty(x.RmaNote) 
                          ? new List<OrdersDC.OrderNote>() 
                          : new List<OrdersDC.OrderNote>{ new OrdersDC.OrderNote{ Text = x.RmaNote } } ))
                //ignores
                .ForMember(dc => dc.Payments, opt => opt.Ignore())
                .ForMember(dc => dc.CustomerAccountId, op => op.Ignore())
                .ForMember(dc => dc.VisitId, op => op.Ignore())
                .ForMember(dc => dc.WebSessionId, op => op.Ignore())
                .ForMember(dc => dc.CustomerInteractionType, op => op.Ignore())
                .ForMember(dc => dc.LocationCode, op => op.Ignore())
                .ForMember(dc => dc.CurrencyCode, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.Packages, op => op.Ignore())
                .ForMember(dc => dc.ProductLossTotal, op => op.Ignore())
                .ForMember(dc => dc.ShippingLossTotal, op => op.Ignore())
                .ForMember(dc => dc.LossTotal, op => op.Ignore())
                .ForMember(dc => dc.ProductLossTaxTotal, op => op.Ignore())
                .ForMember(dc => dc.ShippingLossTaxTotal, op => op.Ignore())
                .ForMember(dc => dc.ChannelCode, op => op.Ignore())
                .ForMember(dc => dc.ChangeMessages, op => op.Ignore())
                  ;

            Mapper.CreateMap<OldReturnItem, ReturnsDC.ReturnItem>()
                  // TODO: not sure why the ReturnItem model on our side doesn't have an id..
                  .ForMember(dc => dc.Id, opt => opt.Ignore())
                  .ForMember(x => x.Reasons, opt => opt.ResolveUsing(x => x.Reason == null 
                      ? null : new List<ReturnsDC.ReturnReason>()
                      {
                          new ReturnsDC.ReturnReason() { Reason = x.Reason, Quantity = x.Quantity }
                      }))
                   .ForMember(dc => dc.Notes, op => op.ResolveUsing(x => string.IsNullOrEmpty(x.RmaNote) 
                      ? new List<OrdersDC.OrderNote>() 
                      : new List<OrdersDC.OrderNote>{ new OrdersDC.OrderNote{ Text = x.RmaNote } } ))
                //ignores
                .ForMember(dc => dc.Product, op => op.Ignore())
                .ForMember(dc => dc.BundledProducts, op => op.Ignore())
                ;

        }

    }

}
