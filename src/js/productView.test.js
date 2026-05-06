import { beforeEach, describe, expect, it, vi } from "vitest"
import ProductView from "./productView.js"
import Storage from "./storage.js"

const setupProductDom = () => {
    document.body.innerHTML = `
        <input id="productTitle" />
        <button id="incQty" class="toggleBtn"></button>
        <button id="decQty" class="toggleBtn"></button>
        <select id="productLocations">
            <option value="none">- select location -</option>
            <option value="BDG">BDG</option>
            <option value="JKT">JKT</option>
        </select>
        <select id="categoriesSelect">
            <option value="none">- select category -</option>
            <option value="Shoes">Shoes</option>
        </select>
        <button id="addNewProductBtn"></button>
        <p id="productQuantity">0</p>
        <input id="searchInput" />
        <select id="sort">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
        </select>
        <ul id="productsCenter"></ul>
    `
}

const createLocalStorageMock = () => {
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

describe("ProductView secure rendering", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        Object.defineProperty(globalThis, "localStorage", {
            value: createLocalStorageMock(),
            configurable: true,
        })
        localStorage.clear()
        setupProductDom()
        vi.spyOn(window, "alert").mockImplementation(() => {})
    })

    it("renders product fields as text instead of executable HTML", () => {
        const productView = new ProductView()
        const payload = `<strong>Injected</strong><img src=x onerror="alert('xss')">`

        productView.showListedProducts([
            {
                id: 1,
                title: payload,
                location: "BDG",
                category: "Shoes",
                persianDate: "2026/05/07",
                quantity: 2,
            },
        ])

        const productsCenter = document.querySelector("#productsCenter")

        expect(productsCenter.textContent).toContain(payload)
        expect(productsCenter.querySelector("strong")).toBeNull()
        expect(productsCenter.querySelector("img")).toBeNull()
    })

    it("keeps malicious titles inert when adding a product through the UI", () => {
        new ProductView()

        const payload = `<img src=x onerror="alert('xss')">`
        document.querySelector("#productTitle").value = payload
        document.querySelector("#productLocations").value = "BDG"
        document.querySelector("#categoriesSelect").value = "Shoes"
        document.querySelector("#productQuantity").innerText = "3"
        document.querySelector("#addNewProductBtn").click()

        const savedProducts = Storage.getProducts
        const productsCenter = document.querySelector("#productsCenter")

        expect(savedProducts).toHaveLength(1)
        expect(savedProducts[0].title).toBe(payload)
        expect(productsCenter.textContent).toContain(payload)
        expect(productsCenter.querySelector("img")).toBeNull()
    })

    it("preserves delete behavior after rendering products safely", () => {
        const productView = new ProductView()
        Storage.saveProducts([
            {
                id: 99,
                title: "Safe product",
                location: "BDG",
                category: "Shoes",
                persianDate: "2026/05/07",
                quantity: 1,
            },
        ])

        productView.showListedProducts(Storage.getProducts)
        document.querySelector(".pdt-dlt-btn").dispatchEvent(new MouseEvent("click", { bubbles: true }))

        expect(Storage.getProducts).toHaveLength(0)
    })
})
