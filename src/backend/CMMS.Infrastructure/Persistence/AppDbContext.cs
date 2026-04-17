using CMMS.Domain.Common;
using CMMS.Domain.Auth;
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
    public DbSet<AuthUser> AuthUsers => Set<AuthUser>();
    public DbSet<AuthUserProfile> AuthUserProfiles => Set<AuthUserProfile>();
    public DbSet<AuthUserAuditLog> AuthUserAuditLogs => Set<AuthUserAuditLog>();
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

        modelBuilder.Entity<AuthUser>(entity =>
        {
            entity.ToTable("auth_users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Email).HasMaxLength(256).IsRequired();
            entity.Property(x => x.PasswordHash).HasMaxLength(512).IsRequired();
            entity.Property(x => x.Role).HasMaxLength(64).IsRequired();
            entity.Property(x => x.IsActive).IsRequired();
            entity.Property(x => x.AccessFailedCount).IsRequired();
            entity.HasIndex(x => new { x.TenantId, x.Email }).IsUnique();
            entity.HasOne(x => x.Profile)
                .WithOne(x => x.AuthUser)
                .HasForeignKey<AuthUserProfile>(x => x.AuthUserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(x => x.AuditLogs)
                .WithOne(x => x.AuthUser)
                .HasForeignKey(x => x.AuthUserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(x => _currentTenant.TenantId.HasValue && x.TenantId == _currentTenant.TenantId.Value);
        });

        modelBuilder.Entity<AuthUserProfile>(entity =>
        {
            entity.ToTable("auth_user_profiles");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FullName).HasMaxLength(256).IsRequired();
            entity.Property(x => x.DisplayName).HasMaxLength(256);
            entity.Property(x => x.PhoneE164).HasMaxLength(32);
            entity.Property(x => x.JobTitle).HasMaxLength(128);
            entity.Property(x => x.Department).HasMaxLength(128);
            entity.Property(x => x.EmployeeCode).HasMaxLength(64);
            entity.Property(x => x.TimeZone).HasMaxLength(64);
            entity.Property(x => x.Locale).HasMaxLength(16);
            entity.Property(x => x.AvatarUrl).HasMaxLength(2048);
            entity.Property(x => x.EmergencyContactName).HasMaxLength(256);
            entity.Property(x => x.EmergencyContactPhoneE164).HasMaxLength(32);
            entity.Property(x => x.MetadataJson).HasColumnType("TEXT").HasDefaultValue("{}");
            entity.HasIndex(x => new { x.TenantId, x.AuthUserId }).IsUnique();
            entity.HasIndex(x => new { x.TenantId, x.EmployeeCode });
            entity.HasQueryFilter(x => _currentTenant.TenantId.HasValue && x.TenantId == _currentTenant.TenantId.Value);
        });

        modelBuilder.Entity<AuthUserAuditLog>(entity =>
        {
            entity.ToTable("auth_user_audit_logs");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.EventType).HasMaxLength(64).IsRequired();
            entity.Property(x => x.ChangedBy).HasMaxLength(256);
            entity.Property(x => x.ChangedFieldsJson).HasColumnType("TEXT");
            entity.HasIndex(x => new { x.TenantId, x.AuthUserId, x.CreatedAtUtc });
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
