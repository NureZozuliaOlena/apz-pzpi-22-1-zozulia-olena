using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Models.DTO
{
    public class FridgeDto
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }

        [Range(-50, 50, ErrorMessage = "Temperature must be between -50 and 50 degrees.")]
        public double MinTemperature { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Inventory level cannot be negative.")]
        public int MinInventoryLevel { get; set; }
        public DateTime LastRestocked { get; set; }
        
        [JsonIgnore]
        public ICollection<FridgeInventory>? FridgeInventories { get; set; } = new List<FridgeInventory>();
    }
}
