using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Kernel.Font;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using iText.IO.Font.Constants;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly SmartLunchDbContext _context;

        public ReportController(SmartLunchDbContext context)
        {
            _context = context;
        }

        [HttpGet("fridges-summary")]
        public async Task<IActionResult> GetFridgesSummary()
        {
            var companies = await _context.Companies
                .Include(c => c.Fridges)
                .ThenInclude(f => f.FridgeInventories)
                .ThenInclude(fi => fi.FoodItem)
                .ToListAsync();

            var memoryStream = new MemoryStream();
            var writer = new PdfWriter(memoryStream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
            document.Add(new Paragraph("Fridges Summary Report")
                .SetFontSize(20)
                .SetFont(boldFont));

            foreach (var company in companies)
            {
                document.Add(new Paragraph($"Company: {company.Name}")
                    .SetFontSize(16)
                    .SetFont(boldFont));

                foreach (var fridge in company.Fridges)
                {
                    document.Add(new Paragraph($"  Fridge ID: {fridge.Id}"));

                    foreach (var inventory in fridge.FridgeInventories)
                    {
                        document.Add(new Paragraph($"      Product: {inventory.FoodItem.Name}, Quantity: {inventory.Quantity}"));
                    }
                }
                document.Add(new Paragraph("\n"));
            }

            document.Close();
            var fileContents = memoryStream.ToArray();
            memoryStream.Dispose();
            return File(fileContents, "application/pdf", "FridgesSummary.pdf");
        }

        [HttpGet("popular-products")]
        public async Task<IActionResult> GetPopularProducts()
        {
            var popularProducts = await _context.OrderItems
                .Include(oi => oi.FridgeInventory)
                .ThenInclude(fi => fi.FoodItem)
                .GroupBy(oi => oi.FridgeInventory.FoodItem.Name)
                .Select(group => new
                {
                    ProductName = group.Key,
                    TotalQuantity = group.Sum(oi => oi.Quantity)
                })
                .OrderByDescending(p => p.TotalQuantity)
                .ToListAsync();

            var memoryStream = new MemoryStream();
            var writer = new PdfWriter(memoryStream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
            document.Add(new Paragraph("Popular Products Report")
                .SetFontSize(20)
                .SetFont(boldFont));

            foreach (var product in popularProducts)
            {
                document.Add(new Paragraph($"Product: {product.ProductName}, Total Quantity: {product.TotalQuantity}"));
            }

            document.Close();
            var fileContents = memoryStream.ToArray();
            memoryStream.Dispose();
            return File(fileContents, "application/pdf", "PopularProducts.pdf");
        }
    }
}
