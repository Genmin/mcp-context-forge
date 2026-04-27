import { useEffect, useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { ServersTable } from "../components/servers/ServersTable";
import { ServersEmptyState } from "../components/servers/ServersEmptyState";
import { ConfirmDialog } from "../components/servers/ConfirmDialog";
import { serversApi } from "../api/servers";
import { sanitizeError } from "../utils/errors";
import type { MCPServer, PaginationMeta } from "../types/server";

export function Servers() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(25);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchServers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await serversApi.list({
          page: currentPage,
          per_page: perPage,
          signal: controller.signal,
        });
        setServers(response.gateways);
        // Cursor-based pagination - no pagination metadata needed for now
        setPagination({
          page: currentPage,
          per_page: perPage,
          total: response.gateways.length,
          total_pages: 1,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Ignore abort errors
        }
        setError(sanitizeError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();

    return () => {
      controller.abort();
    };
  }, [currentPage, perPage]);

  const handleEdit = (_id: string) => {
    // TODO: Implement edit functionality
    throw new Error("Edit functionality not yet implemented");
  };

  const handleDelete = (id: string) => {
    setSelectedServerId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedServerId) return;

    // Optimistic update: remove server from UI immediately
    const previousServers = [...servers];
    setServers(servers.filter(s => s.id !== selectedServerId));
    setDeleteDialogOpen(false);

    try {
      await serversApi.delete(selectedServerId);
      setSelectedServerId(null);
    } catch (err) {
      // Rollback: restore the server on failure
      setServers(previousServers);
      setError(sanitizeError(err));
    }
  };

  const handleTest = async (id: string) => {
    try {
      const result = await serversApi.testConnection(id);
      setTestResult(result.message);
      setTestDialogOpen(true);
    } catch (err) {
      setError(sanitizeError(err));
    }
  };

  const handleNewServer = () => {
    // TODO: Implement new server functionality
    throw new Error("New server functionality not yet implemented");
  };

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(pagination?.total_pages ?? 1, p + 1));
  }, [pagination?.total_pages]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          MCP Servers
        </h1>
        <Button onClick={handleNewServer}>New Server</Button>
      </div>

      {error && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!isLoading && servers.length === 0 ? (
        <ServersEmptyState onAction={handleNewServer} />
      ) : (
        <ServersTable
          servers={servers}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTest={handleTest}
        />
      )}

      {pagination && pagination.total_pages > 1 && (
        <nav aria-label="Server list pagination" className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * perPage + 1} to{" "}
            {Math.min(currentPage * perPage, pagination.total)} of {pagination.total} servers
          </div>
          <div className="flex gap-2" role="group" aria-label="Pagination controls">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label={`Go to previous page (currently on page ${currentPage})`}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === pagination.total_pages}
              aria-label={`Go to next page (currently on page ${currentPage})`}
            >
              Next
            </Button>
          </div>
        </nav>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete MCP Server"
        description="Are you sure you want to delete this MCP server? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        title="Connection Test Result"
        description={testResult || "Testing connection..."}
        confirmLabel="OK"
        cancelLabel=""
        onConfirm={() => setTestDialogOpen(false)}
      />
    </div>
  );
}
