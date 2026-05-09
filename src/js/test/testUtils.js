import { vi } from "vitest"

export const createLocalStorageMock = () => {
    let store = {}

    return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => {
            store[key] = String(value)
        }),
        removeItem: vi.fn((key) => {
            delete store[key]
        }),
        clear: vi.fn(() => {
            store = {}
        }),
    }
}

export const initializeLocalStorage = () => {
    Object.defineProperty(globalThis, "localStorage", {
        value: createLocalStorageMock(),
        configurable: true,
    })
    localStorage.clear()
}
