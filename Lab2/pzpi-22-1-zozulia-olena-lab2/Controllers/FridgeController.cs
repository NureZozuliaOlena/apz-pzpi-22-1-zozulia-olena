using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTO;
using Repositories;

namespace Controllers
{
    [Authorize(Roles = "Admin,Contractor")]
    [ApiController]
    [Route("api/[controller]")]
    public class FridgeController : ControllerBase
    {
        private readonly IFridgeRepository _fridgeRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly IMapper _mapper;

        public FridgeController(IFridgeRepository fridgeRepository, ICompanyRepository companyRepository, IMapper mapper)
        {
            _fridgeRepository = fridgeRepository;
            _companyRepository = companyRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var fridges = await _fridgeRepository.GetAllAsync();
            var fridgeDtos = _mapper.Map<List<FridgeDto>>(fridges);
            return Ok(fridgeDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var fridge = await _fridgeRepository.GetByIdAsync(id);
            if (fridge == null)
            {
                return NotFound();
            }

            var fridgeDto = _mapper.Map<FridgeDto>(fridge);
            return Ok(fridgeDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FridgeDto fridgeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var company = await _companyRepository.GetByIdAsync(fridgeDto.CompanyId);
            if (company == null)
            {
                return BadRequest("Invalid CompanyId. Company does not exist.");
            }

            var fridge = _mapper.Map<Fridge>(fridgeDto);

            fridge.Company = company;

            await _fridgeRepository.AddAsync(fridge);

            var createdFridgeDto = _mapper.Map<FridgeDto>(fridge);
            return CreatedAtAction(nameof(GetById), new { id = createdFridgeDto.Id }, createdFridgeDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] FridgeDto fridgeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingFridge = await _fridgeRepository.GetByIdAsync(id);
            if (existingFridge == null)
            {
                return NotFound();
            }

            var newCompany = await _companyRepository.GetByIdAsync(fridgeDto.CompanyId);
            if (newCompany == null)
            {
                return BadRequest("Invalid CompanyId. Company does not exist.");
            }

            if (existingFridge.CompanyId != fridgeDto.CompanyId)
            {
                var oldCompany = await _companyRepository.GetByIdAsync(existingFridge.CompanyId);
                if (oldCompany != null)
                {
                    oldCompany.Fridges?.Remove(existingFridge);
                    await _companyRepository.UpdateAsync(oldCompany);
                }

                if (newCompany.Fridges == null)
                {
                    newCompany.Fridges = new List<Fridge>();
                }

                newCompany.Fridges.Add(existingFridge);
            }

            _mapper.Map(fridgeDto, existingFridge);
            await _fridgeRepository.UpdateAsync(existingFridge);

            await _companyRepository.UpdateAsync(newCompany);

            var updatedFridgeDto = _mapper.Map<FridgeDto>(existingFridge);
            return Ok(updatedFridgeDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var fridge = await _fridgeRepository.GetByIdAsync(id);
            if (fridge == null)
            {
                return NotFound();
            }

            await _fridgeRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
