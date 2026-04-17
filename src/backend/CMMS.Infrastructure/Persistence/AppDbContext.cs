using CMMS.Domain.Common;
using CMMS.Domain.Project;
using CMMS.Domain.Tasks;
using CMMS.Domain.WorkOrders;
using CMMS.Shared.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace CMMS.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options, ICurrentTenant currentTenant) : DbContext(options)
{
    private readonly ICurrentTenant _currentTenant = currentTenant;

    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<ProjectChangelogEntry> ProjectChangelogEntries => Set<ProjectChangelogEntry>();
    public DbSet<KanbanTask> KanbanTasks => Set<KanbanTask>();
    public DbSet<KanbanTaskAuditLog> KanbanTaskAuditLogs => Set<KanbanTaskAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<WorkOrder>(entity =>
        {
            entity.ToTable("work_orders");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).HasMaxLength(32).IsRequired();
            entity.Property(x => x.Title).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(64).IsRequired();
            entity.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
            entity.HasQueryFilter(x => _currentTenant.TenantId.HasValue && x.TenantId == _currentTenant.TenantId.Value);
        });

        modelBuilder.Entity<KanbanTask>(entity =>
        {
            entity.ToTable("kanban_tasks");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            entity.Property(x => x.Type).HasMaxLength(32).IsRequired();
            entity.Property(x => x.Module).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Assignee).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
            entity.Property(x => x.EstimateHours).HasPrecision(10, 2);
            entity.Property(x => x.SpentHours).HasPrecision(10, 2);
            entity.Property(x => x.TotalSpentHoursOnClose).HasPrecision(10, 2);
            entity.Property(x => x.TotalLeadTimeHoursOnClose).HasPrecision(10, 2);
            entity.Property(x => x.EvidenceJson).HasColumnType("TEXT").HasDefaultValue("[]");
            entity.HasIndex(x => new { x.TenantId, x.Status, x.CreatedAtUtc });
            entity.HasQueryFilter(x => _currentTenant.TenantId.HasValue && x.TenantId == _currentTenant.TenantId.Value);
        });

        modelBuilder.Entity<KanbanTaskAuditLog>(entity =>
        {
            entity.ToTable("kanban_task_audit_logs");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.EventType).HasMaxLength(64).IsRequired();
            entity.Property(x => x.FromStatus).HasMaxLength(32);
            entity.Property(x => x.ToStatus).HasMaxLength(32);
            entity.Property(x => x.FromSpentHours).HasPrecision(10, 2);
            entity.Property(x => x.ToSpentHours).HasPrecision(10, 2);
            entity.Property(x => x.TotalSpentHoursAtClose).HasPrecision(10, 2);
            entity.Property(x => x.TotalLeadTimeHoursAtClose).HasPrecision(10, 2);
            entity.HasIndex(x => new { x.TenantId, x.KanbanTaskId, x.CreatedAtUtc });
            entity.HasOne(x => x.KanbanTask)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.KanbanTaskId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(x => _currentTenant.TenantId.HasValue && x.TenantId == _currentTenant.TenantId.Value);
        });

        modelBuilder.Entity<ProjectChangelogEntry>(entity =>
        {
            entity.ToTable("project_changelog_entries");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Version).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            entity.Property(x => x.Source).HasMaxLength(32).IsRequired();
            entity.HasIndex(x => new { x.Version, x.ReleaseDateUtc, x.Category, x.Description })
                .IsUnique()
                .HasDatabaseName("IX_project_changelog_entries_unique");
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var utcNow = DateTime.UtcNow;
        var tenantId = _currentTenant.TenantId;

        foreach (var entry in ChangeTracker.Entries<AuditableTenantEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = utcNow;
                if (tenantId.HasValue && entry.Entity.TenantId == Guid.Empty)
                {
                    entry.Entity.TenantId = tenantId.Value;
                }
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = utcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
