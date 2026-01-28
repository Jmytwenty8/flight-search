import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

// Create a new QueryClient for each test
function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });
}

interface WrapperProps {
    children: React.ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    initialEntries?: string[];
    queryClient?: QueryClient;
}

function createWrapper(options: CustomRenderOptions = {}) {
    const queryClient = options.queryClient || createTestQueryClient();
    const initialEntries = options.initialEntries || ["/"];

    return function Wrapper({ children }: WrapperProps) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
            </QueryClientProvider>
        );
    };
}

export function renderWithProviders(
    ui: React.ReactElement,
    options: CustomRenderOptions = {}
) {
    const { initialEntries, queryClient, ...renderOptions } = options;

    return {
        ...render(ui, {
            wrapper: createWrapper({ initialEntries, queryClient }),
            ...renderOptions,
        }),
        queryClient: queryClient || createTestQueryClient(),
    };
}

export {
    screen,
    waitFor,
    within,
    fireEvent,
    act,
    cleanup,
    renderHook,
} from "@testing-library/react";
export { renderWithProviders as render };
