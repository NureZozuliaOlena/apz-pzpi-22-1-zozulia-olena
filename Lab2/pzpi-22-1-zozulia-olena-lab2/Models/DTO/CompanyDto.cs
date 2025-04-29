using System.Text.Json.Serialization;

namespace Models.DTO
{
    public class CompanyDto
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string ContactEmail { get; set; }
        public Guid? AdminId { get; set; }

        [JsonIgnore]
        public ICollection<User>? Employees { get; set; } = new List<User>();
        [JsonIgnore]
        public ICollection<Fridge>? Fridges { get; set; } = new List<Fridge>();
    }
}
