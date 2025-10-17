using Encicla.Application.DTOs.Registration;

namespace Encicla.Application.Abstractions.Services
{
    public interface IBlobStorage
    {
        Task<StoredFile> SaveAsync(Stream content, string blobPath, string contentType, CancellationToken ct);
        Task MoveAsync(string fromPath, string toPath, CancellationToken ct);
        Task DeleteAsync(string blobPath, CancellationToken ct);
        Task<bool> ExistsAsync(string blobPath, CancellationToken ct);
    }
}
