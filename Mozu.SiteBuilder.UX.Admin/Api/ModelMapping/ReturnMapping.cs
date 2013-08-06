using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using CustomerDC = Mozu.Customer.Contracts;
using DiscountDC = Mozu.CommerceRuntime.Contracts.Discounts;
using OrdersDC = Mozu.CommerceRuntime.Contracts.Orders;
using ReturnsDC = Mozu.CommerceRuntime.Contracts.Returns;
using PaymentsDC = Mozu.CommerceRuntime.Contracts.Payments;
using ProductsDC = Mozu.CommerceRuntime.Contracts.Products;
using ShippingDC = Mozu.CommerceRuntime.Contracts.Shipping;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ReturnMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<ReturnsDC.Return, Return>()
                  .ForMember(x => x.CreateDate, opt => opt.MapFrom(x => x.AuditInfo.CreateDate))
                  .ForMember(x => x.UpdateDate, opt => opt.MapFrom(x => x.AuditInfo.UpdateDate));
         
            Mapper.CreateMap<ReturnsDC.ReturnItem, ReturnItem>()
                  .ForMember(x => x.Reason, opt => opt.MapFrom(x => x.Reasons == null ? null : x.Reasons.Select(_ => _.Reason).FirstOrDefault()));
            Mapper.CreateMap<ReturnsDC.ReturnItem, ReturnItem>()
                 .ForMember(x => x.Quantity, opt => opt.MapFrom(x => x.Reasons == null ? 0 : x.Reasons.Select(_ => _.Quantity).FirstOrDefault()));
            Mapper.CreateMap<ReturnsDC.ReturnUnitPrice, ReturnUnitPrice>();
            Mapper.CreateMap<OrdersDC.OrderNote, OrderNote>();


            Mapper.CreateMap<ReturnAction, ReturnsDC.ReturnAction>();

            Mapper.CreateMap<Return, ReturnsDC.Return>()
                  .ForMember(x => x.Payments, opt => opt.Ignore());
                  
            Mapper.CreateMap<ReturnItem, ReturnsDC.ReturnItem>()
                  .ForMember(x => x.Reasons, opt => opt.MapFrom(x => x.Reason == null ? null :
                                                                         new List<ReturnsDC.ReturnReason>() { new ReturnsDC.ReturnReason() { Reason = x.Reason, Quantity = x.Quantity } }));

            Mapper.CreateMap<ReturnUnitPrice, ReturnsDC.ReturnUnitPrice>();
            Mapper.CreateMap<OrderNote, OrdersDC.OrderNote>();

        }
    }

}
