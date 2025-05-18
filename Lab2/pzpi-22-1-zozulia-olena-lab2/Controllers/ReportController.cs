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
    [Authorize(Roles = "SuperAdmin,Admin,Contractor")]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly SmartLunchDbContext _context;

        public ReportController(SmartLunchDbContext context)
        {
            _context = context;
        }

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value;

        private Guid? GetCompanyIdFromClaims()
        {
            var companyIdStr = User.FindFirst("CompanyId")?.Value;
            return Guid.TryParse(companyIdStr, out var id) ? id : null;
        }

        [HttpGet("fridges-summary")]
        public async Task<IActionResult> GetFridgesSummary()
        {
            List<Company> companies;

            var role = GetUserRole();
            if (role == "SuperAdmin")
            {
                companies = await _context.Companies
                    .Include(c => c.Fridges)
                        .ThenInclude(f => f.FridgeInventories)
                        .ThenInclude(fi => fi.FoodItem)
                    .ToListAsync();
            }
            else
            {
                var companyId = GetCompanyIdFromClaims();
                if (companyId == null) return Forbid("Invalid or missing CompanyId");

                companies = await _context.Companies
                    .Where(c => c.Id == companyId)
                    .Include(c => c.Fridges)
                        .ThenInclude(f => f.FridgeInventories)
                        .ThenInclude(fi => fi.FoodItem)
                    .ToListAsync();
            }

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
            return File(memoryStream.ToArray(), "application/pdf", "FridgesSummary.pdf");
        }

        [HttpGet("popular-products")]
        public async Task<IActionResult> GetPopularProducts()
        {
            var role = GetUserRole();
            IQueryable<OrderItem> query = _context.OrderItems
                .Include(oi => oi.FridgeInventory)
                    .ThenInclude(fi => fi.FoodItem)
                .Include(oi => oi.FridgeInventory)
                    .ThenInclude(fi => fi.Fridge);

            if (role != "SuperAdmin")
            {
                var companyId = GetCompanyIdFromClaims();
                if (companyId == null) return Forbid("Invalid or missing CompanyId");

                query = query.Where(oi => oi.FridgeInventory.Fridge.CompanyId == companyId);
            }

            var popularProducts = await query
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
            return File(memoryStream.ToArray(), "application/pdf", "PopularProducts.pdf");
        }
    }
}
