using Microsoft.EntityFrameworkCore.Storage;

namespace Encicla.Domain.Repositories
{
    public interface IUnitOfWork
    {
        public Task<IDbContextTransaction> BeginTransactionAsync();
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken);
        public Task CommitTransactionAsync();
    }
}
