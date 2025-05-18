namespace Models.DTO
{
	public class TemperatureLogDto
	{
		public Guid Id { get; set; }
		public Guid FridgeId { get; set; }
		public DateTime Timestamp { get; set; }
		public double Temperature { get; set; }
	}
}
