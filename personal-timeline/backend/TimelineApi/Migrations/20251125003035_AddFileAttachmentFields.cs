using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimelineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddFileAttachmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileAttachment",
                table: "Entries",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "Entries",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FileType",
                table: "Entries",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileAttachment",
                table: "Entries");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "Entries");

            migrationBuilder.DropColumn(
                name: "FileType",
                table: "Entries");
        }
    }
}
