using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Encicla.Application.Abstractions.Services;
using Encicla.Application.DTOs.Registration;
using Microsoft.Extensions.Options;

namespace Encicla.Infrastructure.MicrosoftAzure.BlobStorage
{
    public class StorageOptions
    {
        public string AccountUrl { get; set; } = "https://stenciclaprd01.blob.core.windows.net";
        public string Container { get; set; } = "stenciclaprd01";
    }
    public class AzureBlobStorage : IBlobStorage
    {
        private readonly BlobServiceClient _svc;
        private readonly BlobContainerClient _container;

        public AzureBlobStorage(IOptions<StorageOptions> opt)
        {
            // Managed Identity por defecto; si usas SP, configúralo en DI.
            _svc = new BlobServiceClient(new Uri(opt.Value.AccountUrl), new DefaultAzureCredential());
            _container = _svc.GetBlobContainerClient(opt.Value.Container);
        }

        public async Task<StoredFile> SaveAsync(Stream content, string blobPath, string contentType, CancellationToken ct)
        {
            var blob = _container.GetBlobClient(blobPath);
            await blob.UploadAsync(content, new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
            }, ct);
            return new StoredFile(blobPath, blob.Uri);
        }

        public async Task MoveAsync(string fromPath, string toPath, CancellationToken ct)
        {
            var src = _container.GetBlobClient(fromPath);
            var dst = _container.GetBlobClient(toPath);
            await dst.StartCopyFromUriAsync(src.Uri, cancellationToken: ct);
            await src.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, cancellationToken: ct);
        }

        public Task DeleteAsync(string blobPath, CancellationToken ct)
            => _container.GetBlobClient(blobPath).DeleteIfExistsAsync(cancellationToken: ct);

        public async Task<bool> ExistsAsync(string blobPath, CancellationToken ct)
            => (await _container.GetBlobClient(blobPath).ExistsAsync(ct)).Value;
    }
}
