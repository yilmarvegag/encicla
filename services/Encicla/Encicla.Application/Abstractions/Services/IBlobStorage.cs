namespace Encicla.Application.Abstractions.Services
{
    public interface IBlobStorage
    {
        Task<string> UploadAsync(Stream content, string contentType, string fileName, CancellationToken ct);
        Task<Stream> DownloadAsync(string blobId, CancellationToken ct);
    }
}
