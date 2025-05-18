using Microsoft.EntityFrameworkCore;
using Data;
using Enums;
using Models;

namespace Service
{
    public class PredictionService
    {
        private readonly SmartLunchDbContext _context;

        public PredictionService(SmartLunchDbContext context)
        {
            _context = context;
        }

        public void PredictAndNotify()
        {
            var todayOrders = _context.Orders
                .Include(o => o.Items)
                .Where(o => o.Timestamp.Date == DateTime.Now.Date)
                .ToList();

            var fridges = _context.Fridges
                .Include(f => f.FridgeInventories)
                .ThenInclude(fi => fi.FoodItem)
                .ToList();

            foreach (var fridge in fridges)
            {
                foreach (var inventory in fridge.FridgeInventories)
                {
                    var fridgeOrders = todayOrders.Where(o => o.FridgeId == fridge.Id);

                    var totalSoldToday = fridgeOrders
                        .SelectMany(o => o.Items)
                        .Where(item => item.FridgeInventoryId == inventory.Id)
                        .Sum(item => item.Quantity);

                    int remainingStock = inventory.Quantity - totalSoldToday;
                    if (remainingStock < 0) remainingStock = 0;

                    var historicalSales = _context.OrderItems
                        .Include(oi => oi.Order)
                        .Where(oi => oi.Order.FridgeId == fridge.Id && oi.FridgeInventoryId == inventory.Id)
                        .GroupBy(oi => oi.Order.Timestamp.Date)
                        .Select(g => new { Date = g.Key, TotalSold = g.Sum(oi => oi.Quantity) })
                        .ToList();

                    double averageDailyConsumption = historicalSales.Any()
                        ? historicalSales.Average(s => s.TotalSold)
                        : (totalSoldToday > 0 ? totalSoldToday : 1);

                    if (averageDailyConsumption > 0)
                    {
                        int predictedDaysToDepletion = (int)Math.Ceiling((double)remainingStock / averageDailyConsumption);

                        int notificationThresholdDays = 2;

                        if (predictedDaysToDepletion <= notificationThresholdDays)
                        {
                            SendNotification(fridge, inventory, remainingStock);
                        }
                    }
                }
            }
        }

        private void SendNotification(Fridge fridge, FridgeInventory inventory, int remainingStock)
        {
            var contractorUser = _context.Users
                .Where(u => u.CompanyId == fridge.CompanyId && u.Role == UserRole.Contractor)
                .FirstOrDefault();

            if (contractorUser != null)
            {
                bool notificationExists = _context.Notifications
                    .Any(n => n.UserId == contractorUser.Id &&
                              n.Text.Contains($"Product {inventory.FoodItem.Name} in fridge {fridge.Id}"));

                if (!notificationExists)
                {
                    var notification = new Notification
                    {
                        Title = "Restocking Required",
                        Text = $"Product {inventory.FoodItem.Name} in fridge {fridge.Id} has {remainingStock} item(s) left and needs restocking.",
                        DateTimeCreated = DateTime.Now,
                        UserId = contractorUser.Id
                    };

                    _context.Notifications.Add(notification);
                    _context.SaveChanges();
                }
            }
        }

    }
}
