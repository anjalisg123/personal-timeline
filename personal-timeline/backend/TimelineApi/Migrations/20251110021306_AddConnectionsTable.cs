using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimelineApi.Migrations
{
    /// <inheritdoc />
    public partial class AddConnectionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApiConnections_Users_UserId",
                table: "ApiConnections");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApiConnections",
                table: "ApiConnections");

            migrationBuilder.RenameTable(
                name: "ApiConnections",
                newName: "Connections");

            migrationBuilder.RenameIndex(
                name: "IX_ApiConnections_UserId_ApiProvider",
                table: "Connections",
                newName: "IX_Connections_UserId_ApiProvider");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Connections",
                table: "Connections",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_UserId",
                table: "Connections",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_UserId",
                table: "Connections");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Connections",
                table: "Connections");

            migrationBuilder.RenameTable(
                name: "Connections",
                newName: "ApiConnections");

            migrationBuilder.RenameIndex(
                name: "IX_Connections_UserId_ApiProvider",
                table: "ApiConnections",
                newName: "IX_ApiConnections_UserId_ApiProvider");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApiConnections",
                table: "ApiConnections",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApiConnections_Users_UserId",
                table: "ApiConnections",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
