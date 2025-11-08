// Controllers/FlavorsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks; 
using WebApplication1.Models; // <-- ¡El 'using' que arregla tu error!
using WebApplication1.Data;   // <-- El 'using' para el DbContext

// ▼▼▼ ¡Asegúrate de que tu controlador esté envuelto en su namespace! ▼▼▼
namespace WebApplication1.Controllers 
{
    [ApiController]
    [Route("api/flavors")]
    public class FlavorsController : ControllerBase
    {
        // 1. Ya no tenemos una lista estática.
        // En su lugar, guardamos una referencia a nuestro "Contexto" de BD.
        private readonly ApiDbContext _context;

        // 2. El "Constructor":
        // ASP.NET "Inyectará" automáticamente el ApiDbContext 
        // que registramos en Program.cs
        public FlavorsController(ApiDbContext context)
        {
            _context = context;
        }

        // 📖 GET (Leer)
        [HttpGet]
        public async Task<IActionResult> GetFlavors()
        {
            var flavors = await _context.Flavors.ToListAsync();
            return Ok(flavors);
        }

        // ➕ POST (Crear)
        [HttpPost]
        public async Task<IActionResult> CreateFlavor([FromBody] Flavor newFlavor)
        {
            _context.Flavors.Add(newFlavor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFlavorById), new { id = newFlavor.Id }, newFlavor);
        }

        // 🔄 PUT (Actualizar)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFlavor(int id, [FromBody] Flavor updatedFlavor)
        {
            var existingFlavor = await _context.Flavors.FindAsync(id);
            
            if (existingFlavor == null)
            {
                return NotFound();
            }

            existingFlavor.Name = updatedFlavor.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ❌ DELETE (Borrar)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFlavor(int id)
        {
            var flavorToDelete = await _context.Flavors.FindAsync(id);

            if (flavorToDelete == null)
            {
                return NotFound();
            }

            _context.Flavors.Remove(flavorToDelete);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- MÉTODO EXTRA (Helper) ---
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFlavorById(int id)
        {
            var flavor = await _context.Flavors.FindAsync(id);
            if (flavor == null)
            {
                return NotFound();
            }
            return Ok(flavor);
        }
    }
}