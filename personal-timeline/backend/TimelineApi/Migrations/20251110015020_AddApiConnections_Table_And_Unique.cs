using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimelineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddApiConnections_Table_And_Unique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApiConnections_Users_UserId1",
                table: "ApiConnections");

            migrationBuilder.DropIndex(
                name: "IX_ApiConnections_UserId_ApiProvider",
                table: "ApiConnections");

            migrationBuilder.DropIndex(
                name: "IX_ApiConnections_UserId1",
                table: "ApiConnections");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "ApiConnections");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "ApiConnections",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.CreateIndex(
                name: "IX_ApiConnections_UserId_ApiProvider",
                table: "ApiConnections",
                columns: new[] { "UserId", "ApiProvider" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiConnections_Users_UserId",
                table: "ApiConnections",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApiConnections_Users_UserId",
                table: "ApiConnections");

            migrationBuilder.DropIndex(
                name: "IX_ApiConnections_UserId_ApiProvider",
                table: "ApiConnections");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "ApiConnections",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "ApiConnections",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApiConnections_UserId_ApiProvider",
                table: "ApiConnections",
                columns: new[] { "UserId", "ApiProvider" });

            migrationBuilder.CreateIndex(
                name: "IX_ApiConnections_UserId1",
                table: "ApiConnections",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ApiConnections_Users_UserId1",
                table: "ApiConnections",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
