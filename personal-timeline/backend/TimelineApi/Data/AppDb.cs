using Microsoft.EntityFrameworkCore;

namespace TimelineApi.Data;

public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TimelineEntry> Entries => Set<TimelineEntry>();

    public DbSet<ApiConnection> Connections => Set<ApiConnection>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(u => u.Email);

        b.Entity<TimelineEntry>()
            .HasIndex(e => new { e.UserId, e.EventDate });


        b.Entity<ApiConnection>()
            .HasIndex(c => new { c.UserId, c.ApiProvider })
            .IsUnique();
    }

}
