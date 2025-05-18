using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTO;
using Repositories;
using AutoMapper;
using Models;
using Service;
using Data;

namespace Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderItemController : ControllerBase
    {
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;
        private readonly IFridgeInventoryRepository _fridgeInventoryRepository;
        private readonly IFridgeRepository _fridgeRepository;
        private readonly SmartLunchDbContext _context;

        public OrderItemController(IOrderItemRepository orderItemRepository,
            IOrderRepository orderRepository,
            IMapper mapper,
            IFridgeInventoryRepository fridgeInventoryRepository,
            IFridgeRepository fridgeRepository,
            SmartLunchDbContext context)
        {
            _orderItemRepository = orderItemRepository;
            _orderRepository = orderRepository;
            _mapper = mapper;
            _fridgeInventoryRepository = fridgeInventoryRepository;
            _fridgeRepository = fridgeRepository;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
            {
                var allOrderItems = await _orderItemRepository.GetAllAsync();
                var allDtos = _mapper.Map<List<OrderItemDto>>(allOrderItems);
                return Ok(allDtos);
            }

            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                var allItems = await _orderItemRepository.GetAllAsync();

                var filteredItems = allItems
                    .Where(item => item.Order?.Fridge?.CompanyId == companyId)
                    .ToList();

                var dtos = _mapper.Map<List<OrderItemDto>>(filteredItems);
                return Ok(dtos);
            }

            return Forbid();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var orderItem = await _orderItemRepository.GetByIdAsync(id);
            if (orderItem == null)
                return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "SuperAdmin")
            {
                var dto = _mapper.Map<OrderItemDto>(orderItem);
                return Ok(dto);
            }

            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out Guid companyId))
                    return BadRequest("Invalid CompanyId claim.");

                var order = await _orderRepository.GetByIdAsync(orderItem.OrderId);

                if (order == null || order.Fridge.CompanyId != companyId)
                    return Forbid("Access denied. OrderItem does not belong to your company.");

                var dto = _mapper.Map<OrderItemDto>(orderItem);
                return Ok(dto);
            }

            return Forbid();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderItemDto orderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            Guid companyId = Guid.Empty;

            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out companyId))
                    return BadRequest("Invalid CompanyId claim.");
            }
            else if (role != "SuperAdmin")
            {
                return Forbid();
            }

            var fridgeInventory = await _fridgeInventoryRepository.GetByIdAsync(orderItemDto.FridgeInventoryId);
            if (fridgeInventory == null)
            {
                return BadRequest($"Product with inventory ID {orderItemDto.FridgeInventoryId} does not exist.");
            }

            if (fridgeInventory.Quantity < orderItemDto.Quantity)
            {
                return BadRequest($"Not enough quantity for product with inventory ID {orderItemDto.FridgeInventoryId} in fridge.");
            }

            var fridge = await _fridgeRepository.GetByIdAsync(fridgeInventory.FridgeId);
            if (fridge == null)
            {
                return BadRequest($"Fridge with ID {fridgeInventory.FridgeId} does not exist.");
            }

            if (role == "Admin" && fridge.CompanyId != companyId)
            {
                return Forbid("Access denied. Fridge does not belong to your company.");
            }

            var order = await _orderRepository.GetByIdAsync(orderItemDto.OrderId);
            if (order == null)
            {
                return BadRequest("Invalid OrderId. Order does not exist.");
            }

            if (role == "Admin" && order.Fridge.CompanyId != companyId)
            {
                return Forbid("Access denied. Order does not belong to your company.");
            }

            var orderItem = _mapper.Map<OrderItem>(orderItemDto);

            await _orderItemRepository.AddAsync(orderItem);

            fridgeInventory.Quantity -= orderItemDto.Quantity;
            await _fridgeInventoryRepository.UpdateAsync(fridgeInventory);

            await _fridgeRepository.UpdateAsync(fridge);

            var predictionService = new PredictionService(_context);
            predictionService.PredictAndNotify();

            var createdOrderItemDto = _mapper.Map<OrderItemDto>(orderItem);
            return CreatedAtAction(nameof(GetById), new { id = createdOrderItemDto.Id }, createdOrderItemDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] OrderItemDto orderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            Guid companyId = Guid.Empty;
            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out companyId))
                    return BadRequest("Invalid CompanyId claim.");
            }
            else if (role != "SuperAdmin")
            {
                return Forbid();
            }

            var existingOrderItem = await _orderItemRepository.GetByIdAsync(id);
            if (existingOrderItem == null)
            {
                return NotFound("OrderItem not found.");
            }

            var order = await _orderRepository.GetByIdAsync(existingOrderItem.OrderId);
            if (order == null)
            {
                return BadRequest("Invalid OrderId. Order does not exist.");
            }

            if (role == "Admin" && order.Fridge.CompanyId != companyId)
            {
                return Forbid("Access denied. OrderItem does not belong to your company.");
            }

            if (existingOrderItem.OrderId != orderItemDto.OrderId)
            {
                return BadRequest("OrderItem does not belong to the specified Order.");
            }

            _mapper.Map(orderItemDto, existingOrderItem);

            await _orderItemRepository.UpdateAsync(existingOrderItem);

            var updatedOrderItemDto = _mapper.Map<OrderItemDto>(existingOrderItem);
            return Ok(updatedOrderItemDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            Guid companyId = Guid.Empty;
            if (role == "Admin")
            {
                var companyIdClaim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId")?.Value;
                if (string.IsNullOrEmpty(companyIdClaim))
                    return BadRequest("CompanyId claim missing.");

                if (!Guid.TryParse(companyIdClaim, out companyId))
                    return BadRequest("Invalid CompanyId claim.");
            }
            else if (role != "SuperAdmin")
            {
                return Forbid();
            }

            var orderItem = await _orderItemRepository.GetByIdAsync(id);
            if (orderItem == null)
            {
                return NotFound();
            }

            var order = await _orderRepository.GetByIdAsync(orderItem.OrderId);
            if (order == null)
            {
                return BadRequest("Invalid OrderId. Order does not exist.");
            }

            if (role == "Admin" && order.Fridge.CompanyId != companyId)
            {
                return Forbid("Access denied. OrderItem does not belong to your company.");
            }

            await _orderItemRepository.DeleteAsync(id);
            return NoContent();
        }

    }
}
