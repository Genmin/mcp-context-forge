/**
 * MCP Servers API service
 *
 * Wraps /gateways backend endpoint but exposes as "servers" API
 * for frontend consistency.
 */

import { api } from "./client";
import type { ServersResponse, MCPServer } from "../types/server";

export const serversApi = {
  /**
   * List all MCP servers with pagination
   */
  list: (params?: {
    page?: number;
    per_page?: number;
    include_inactive?: boolean;
    signal?: AbortSignal;
  }): Promise<ServersResponse> => {
    const searchParams = new URLSearchParams();

    // Validate and clamp page number
    if (params?.page !== undefined) {
      const page = Number.isFinite(params.page)
        ? Math.max(1, Math.floor(params.page))
        : 1;
      searchParams.set("page", page.toString());
    }

    // Validate and clamp per_page (1-100)
    if (params?.per_page !== undefined) {
      const perPage = Number.isFinite(params.per_page)
        ? Math.max(1, Math.min(100, Math.floor(params.per_page)))
        : 25;
      searchParams.set("per_page", perPage.toString());
    }

    if (params?.include_inactive) {
      searchParams.set("include_inactive", "true");
    }

    // Always request pagination metadata to get structured response
    searchParams.set("include_pagination", "true");

    const query = searchParams.toString();
    return api.get(`/gateways${query ? `?${query}` : ""}`, { signal: params?.signal });
  },

  /**
   * Get a single MCP server by ID
   */
  get: (id: string): Promise<MCPServer> => {
    return api.get(`/gateways/${id}`);
  },

  /**
   * Delete an MCP server
   */
  delete: (id: string): Promise<void> => {
    return api.delete(`/gateways/${id}`);
  },

  /**
   * Test connection to an MCP server
   */
  testConnection: (id: string): Promise<{ success: boolean; message: string }> => {
    return api.post(`/gateways/${id}/test`, {});
  },
};
