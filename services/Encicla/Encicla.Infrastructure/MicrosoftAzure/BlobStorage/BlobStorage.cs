using Azure.Storage.Blobs;
using Encicla.Application.Abstractions.Services;
using Microsoft.Extensions.Options;

namespace Encicla.Infrastructure.MicrosoftAzure.BlobStorage
{
    public class BlobOptions
    {
        public string ConnectionString { get; set; } = default!;
        public string Container { get; set; } = "encicla";
    }
    public class AzureBlobStorage : IBlobStorage
    {
        private readonly BlobContainerClient _container;

        public AzureBlobStorage(IOptions<BlobOptions> options)
        {
            var cfg = options.Value;
            var service = new BlobServiceClient(cfg.ConnectionString);
            _container = service.GetBlobContainerClient(cfg.Container);
            _container.CreateIfNotExists();
        }

        public async Task<string> UploadAsync(Stream content, string contentType, string fileName, CancellationToken ct)
        {
            var id = $"{Guid.NewGuid()}_{fileName}";
            var blob = _container.GetBlobClient(id);
            await blob.UploadAsync(content, new Azure.Storage.Blobs.Models.BlobHttpHeaders { ContentType = contentType }, cancellationToken: ct);
            return id;
        }

        public Task<Stream> DownloadAsync(string blobId, CancellationToken ct)
        {
            var blob = _container.GetBlobClient(blobId);
            return blob.OpenReadAsync(cancellationToken: ct);
        }
    }
}
