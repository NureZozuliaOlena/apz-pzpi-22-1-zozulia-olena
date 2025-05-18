using Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Models.DTO
{
    public class OrderDto
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid FridgeId { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Total amount must be greater than 0.")]
        public decimal TotalAmount { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public DateTime Timestamp { get; set; }
        
        [JsonIgnore]
        public ICollection<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
    }
}
