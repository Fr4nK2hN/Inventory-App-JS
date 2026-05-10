import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProductView from "./productView.js"
import Storage from "./storage.js"
import { initializeLocalStorage } from "./test/testUtils.js"

const setupProductDom = () => {
    document.body.innerHTML = `
        <input id="productTitle" aria-label="Product title" />
        <button id="incQty" class="toggleBtn" type="button">+</button>
        <button id="decQty" class="toggleBtn" type="button">-</button>
        <select id="productLocations">
            <option value="none">- select location -</option>
            <option value="BDG">BDG</option>
            <option value="JKT">JKT</option>
        </select>
        <select id="categoriesSelect">
            <option value="none">- select category -</option>
            <option value="Shoes">Shoes</option>
        </select>
        <button id="addNewProductBtn" type="button">Add Product</button>
        <p id="productQuantity">0</p>
        <input id="searchInput" aria-label="Search products" />
        <select id="sort">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
        </select>
        <ul id="productsCenter"></ul>
    `
}

const initializeTestEnvironment = () => {
    vi.restoreAllMocks()
    initializeLocalStorage()
    setupProductDom()
    vi.spyOn(window, "alert").mockImplementation(() => {})
}

const createSeedProducts = () => [
    {
        id: 1,
        title: "Running Shoes",
        location: "BDG",
        category: "Shoes",
        persianDate: "2026/05/07",
        quantity: 2,
    },
    {
        id: 2,
        title: "Backpack",
        location: "JKT",
        category: "Bags",
        persianDate: "2026/05/07",
        quantity: 4,
    },
    {
        id: 3,
        title: "Shoe Cleaner",
        location: "BDG",
        category: "Shoes",
        persianDate: "2026/05/07",
        quantity: 1,
    },
]

const getRenderedProductItems = () => document.querySelectorAll("#productsCenter li")
const getRenderedProductTitles = () =>
    [...getRenderedProductItems()].map((item) => item.querySelector("p")?.textContent ?? "")
const selectSort = async (user, sortType) => {
    await user.selectOptions(document.querySelector("#sort"), sortType)
}
const typeSearch = async (user, term) => {
    await user.type(screen.getByLabelText("Search products"), term)
}
const clearSearchViaKeyup = () => {
    const searchInput = screen.getByLabelText("Search products")
    searchInput.value = ""
    searchInput.dispatchEvent(new KeyboardEvent("keyup", { key: "Backspace", bubbles: true }))
}
const deleteFirstRenderedProduct = async (user) => {
    await user.click(document.querySelector(".pdt-dlt-btn"))
}
const setupProductViewWithSeedData = () => {
    const productView = new ProductView()
    Storage.saveProducts(createSeedProducts())
    productView.setupApp()
    return productView
}

describe("ProductView secure rendering", () => {
    beforeEach(() => {
        initializeTestEnvironment()
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

        expect(screen.getByText(payload)).toBeInTheDocument()
        expect(document.querySelector("strong")).not.toBeInTheDocument()
        expect(document.querySelector("img")).not.toBeInTheDocument()
    })

    it("keeps malicious titles inert when adding a product through the UI", async () => {
        new ProductView()
        const user = userEvent.setup()

        const payload = `<img src=x onerror="alert('xss')">`
        await user.type(screen.getByLabelText("Product title"), payload)
        await user.selectOptions(document.querySelector("#productLocations"), "BDG")
        await user.selectOptions(document.querySelector("#categoriesSelect"), "Shoes")
        document.querySelector("#productQuantity").innerText = "3"
        await user.click(screen.getByRole("button", { name: /add product/i }))

        const savedProducts = Storage.getProducts

        expect(savedProducts).toHaveLength(1)
        expect(savedProducts[0].title).toBe(payload)
        expect(screen.getByText(payload)).toBeInTheDocument()
        expect(document.querySelector("img")).not.toBeInTheDocument()
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

describe("ProductView search filtering", () => {
    beforeEach(() => {
        initializeTestEnvironment()
    })

    it("searches by keyword", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await user.type(screen.getByLabelText("Search products"), "backpack")

        expect(screen.getByText("Backpack")).toBeInTheDocument()
        expect(screen.queryByText("Running Shoes")).not.toBeInTheDocument()
        expect(screen.queryByText("Shoe Cleaner")).not.toBeInTheDocument()
    })

    it("supports partial keyword matching", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await user.type(screen.getByLabelText("Search products"), "shoe")

        expect(screen.getByText("Running Shoes")).toBeInTheDocument()
        expect(screen.getByText("Shoe Cleaner")).toBeInTheDocument()
        expect(screen.queryByText("Backpack")).not.toBeInTheDocument()
        expect(getRenderedProductItems()).toHaveLength(2)
    })

    it("performs case-insensitive search", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await user.type(screen.getByLabelText("Search products"), "SHOE")

        expect(screen.getByText("Running Shoes")).toBeInTheDocument()
        expect(screen.getByText("Shoe Cleaner")).toBeInTheDocument()
        expect(screen.queryByText("Backpack")).not.toBeInTheDocument()
    })

    it("returns all products when search is empty", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        const searchInput = screen.getByLabelText("Search products")
        await user.type(searchInput, "shoe")
        searchInput.value = ""
        searchInput.dispatchEvent(new KeyboardEvent("keyup", { key: "Backspace", bubbles: true }))

        expect(screen.getByText("Running Shoes")).toBeInTheDocument()
        expect(screen.getByText("Shoe Cleaner")).toBeInTheDocument()
        expect(screen.getByText("Backpack")).toBeInTheDocument()
        expect(getRenderedProductItems()).toHaveLength(3)
    })

    it("preserves search state after re-render", async () => {
        const user = userEvent.setup()
        const productView = setupProductViewWithSeedData()

        await user.type(screen.getByLabelText("Search products"), "shoe")
        productView.refreshProductsList()

        expect(screen.getByText("Running Shoes")).toBeInTheDocument()
        expect(screen.getByText("Shoe Cleaner")).toBeInTheDocument()
        expect(screen.queryByText("Backpack")).not.toBeInTheDocument()
        expect(getRenderedProductItems()).toHaveLength(2)
    })
})

describe("ProductView sorting", () => {
    beforeEach(() => {
        initializeTestEnvironment()
    })

    it("sorts products in ascending order", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await user.selectOptions(document.querySelector("#sort"), "A-Z")

        expect(getRenderedProductTitles()).toEqual(["Backpack", "Running Shoes", "Shoe Cleaner"])
    })

    it("sorts products in descending order", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await user.selectOptions(document.querySelector("#sort"), "Z-A")

        expect(getRenderedProductTitles()).toEqual(["Shoe Cleaner", "Running Shoes", "Backpack"])
    })

    it("applies sorting after filtering", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await user.type(screen.getByLabelText("Search products"), "shoe")
        await user.selectOptions(document.querySelector("#sort"), "Z-A")

        expect(getRenderedProductTitles()).toEqual(["Shoe Cleaner", "Running Shoes"])
    })

    it("preserves sorting state after re-render", async () => {
        const user = userEvent.setup()
        const productView = setupProductViewWithSeedData()

        await user.selectOptions(document.querySelector("#sort"), "A-Z")
        productView.refreshProductsList()

        expect(getRenderedProductTitles()).toEqual(["Backpack", "Running Shoes", "Shoe Cleaner"])
    })

    it("keeps sorting behavior consistent across repeated operations", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await user.selectOptions(document.querySelector("#sort"), "A-Z")
        const firstAscendingOrder = getRenderedProductTitles()

        await user.selectOptions(document.querySelector("#sort"), "Z-A")
        await user.selectOptions(document.querySelector("#sort"), "A-Z")

        expect(getRenderedProductTitles()).toEqual(firstAscendingOrder)
    })
})

describe("ProductView unified rendering pipeline", () => {
    beforeEach(() => {
        initializeTestEnvironment()
    })

    it("supports filtering then sorting", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await typeSearch(user, "shoe")
        await selectSort(user, "Z-A")

        expect(getRenderedProductTitles()).toEqual(["Shoe Cleaner", "Running Shoes"])
    })

    it("supports sorting then filtering", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await selectSort(user, "A-Z")
        await typeSearch(user, "shoe")

        expect(getRenderedProductTitles()).toEqual(["Running Shoes", "Shoe Cleaner"])
    })

    it("preserves filter state after deletion", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await typeSearch(user, "shoe")
        await deleteFirstRenderedProduct(user)

        expect(getRenderedProductTitles()).toEqual(["Running Shoes"])
        expect(screen.queryByText("Backpack")).not.toBeInTheDocument()
    })

    it("preserves sorting state after deletion", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await selectSort(user, "A-Z")
        await deleteFirstRenderedProduct(user)

        expect(getRenderedProductTitles()).toEqual(["Running Shoes", "Shoe Cleaner"])
    })

    it("keeps rendering consistent across state updates", async () => {
        const user = userEvent.setup()
        const productView = setupProductViewWithSeedData()

        await selectSort(user, "A-Z")
        await typeSearch(user, "shoe")
        await deleteFirstRenderedProduct(user)
        clearSearchViaKeyup()
        productView.refreshProductsList()

        expect(getRenderedProductTitles()).toEqual(["Backpack", "Shoe Cleaner"])
    })
})

describe("ProductView deletion behavior", () => {
    beforeEach(() => {
        initializeTestEnvironment()
    })

    it("does not reset search state after deletion", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await typeSearch(user, "shoe")
        await deleteFirstRenderedProduct(user)

        expect(screen.getByLabelText("Search products")).toHaveValue("shoe")
        expect(getRenderedProductTitles()).toEqual(["Running Shoes"])
        expect(screen.queryByText("Backpack")).not.toBeInTheDocument()
    })

    it("does not reset sorting state after deletion", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await selectSort(user, "A-Z")
        await deleteFirstRenderedProduct(user)

        expect(document.querySelector("#sort")).toHaveValue("A-Z")
        expect(getRenderedProductTitles()).toEqual(["Running Shoes", "Shoe Cleaner"])
    })

    it("keeps rendering consistent after deletion", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await selectSort(user, "A-Z")
        await typeSearch(user, "shoe")
        await deleteFirstRenderedProduct(user)

        const renderedTitles = getRenderedProductTitles()
        const storedProducts = Storage.getProducts

        expect(renderedTitles).toEqual(["Shoe Cleaner"])
        expect(getRenderedProductItems()).toHaveLength(1)
        expect(storedProducts).toHaveLength(2)
        expect(storedProducts.some((product) => product.title === "Running Shoes")).toBe(false)
    })

    it("keeps filtered list correct after deletion", async () => {
        const user = userEvent.setup()
        setupProductViewWithSeedData()

        await typeSearch(user, "shoe")
        await deleteFirstRenderedProduct(user)

        expect(getRenderedProductTitles()).toEqual(["Running Shoes"])
        expect(screen.queryByText("Backpack")).not.toBeInTheDocument()
        expect(getRenderedProductItems()).toHaveLength(1)
    })
})

describe("ProductView branch behavior", () => {
    beforeEach(() => {
        initializeTestEnvironment()
    })

    it("shows validation alert and skips persistence when product title is too short", async () => {
        const user = userEvent.setup()
        new ProductView()

        await user.type(screen.getByLabelText("Product title"), "a")
        await user.click(screen.getByRole("button", { name: /add product/i }))

        expect(window.alert).toHaveBeenCalledWith("Title must be at least 2 characters!")
        expect(Storage.getProducts).toHaveLength(0)
    })

    it("requires a selected product location", async () => {
        const user = userEvent.setup()
        new ProductView()

        await user.type(screen.getByLabelText("Product title"), "Valid product")
        await user.selectOptions(document.querySelector("#categoriesSelect"), "Shoes")
        await user.click(screen.getByRole("button", { name: /add product/i }))

        expect(window.alert).toHaveBeenCalledWith("Please select a location!")
        expect(Storage.getProducts).toHaveLength(0)
    })

    it("requires a selected product category", async () => {
        const user = userEvent.setup()
        new ProductView()

        await user.type(screen.getByLabelText("Product title"), "Valid product")
        await user.selectOptions(document.querySelector("#productLocations"), "BDG")
        await user.click(screen.getByRole("button", { name: /add product/i }))

        expect(window.alert).toHaveBeenCalledWith("Please select a category!")
        expect(Storage.getProducts).toHaveLength(0)
    })

    it("stores product quantity as a number after validation succeeds", async () => {
        const user = userEvent.setup()
        new ProductView()

        await user.type(screen.getByLabelText("Product title"), "Valid product")
        await user.selectOptions(document.querySelector("#productLocations"), "BDG")
        await user.selectOptions(document.querySelector("#categoriesSelect"), "Shoes")
        document.querySelector("#productQuantity").innerText = "3"
        await user.click(screen.getByRole("button", { name: /add product/i }))

        expect(Storage.getProducts).toHaveLength(1)
        expect(Storage.getProducts[0].quantity).toBe(3)
    })

    it("falls back to unsorted storage order when sort type is unknown", () => {
        const productView = setupProductViewWithSeedData()
        productView.sortBySelect("unknown-sort")

        expect(getRenderedProductTitles()).toEqual(["Running Shoes", "Backpack", "Shoe Cleaner"])
    })

    it("syncs pre-filled controls on setup before first render", () => {
        Storage.saveProducts(createSeedProducts())
        document.querySelector("#searchInput").value = "shoe"
        document.querySelector("#sort").value = "A-Z"

        const productView = new ProductView()
        productView.setupApp()

        expect(getRenderedProductTitles()).toEqual(["Running Shoes", "Shoe Cleaner"])
    })

    it("updates quantity in both increment and decrement directions", async () => {
        const user = userEvent.setup()
        new ProductView()

        await user.click(document.querySelector("#incQty"))
        await user.click(document.querySelector("#decQty"))

        expect(document.querySelector("#productQuantity")).toHaveTextContent("0")
    })
})
