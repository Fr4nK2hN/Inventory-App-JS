import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CategoryView from "./categoryView.js"
import Storage from "./storage.js"
import { initializeLocalStorage } from "./test/testUtils.js"

const setupCategoryDom = () => {
    document.body.innerHTML = `
        <input id="categoryTitle" aria-label="Category title" />
        <textarea id="categoryDescription" aria-label="Category description"></textarea>
        <button id="categoryCanelBtn" type="button">Cancel</button>
        <button id="categoryAddNewBtn" type="button">Add Category</button>
        <select id="categoriesSelect">
            <option value="none">- select category -</option>
        </select>
    `
}

describe("CategoryView persistence logic", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        initializeLocalStorage()
        setupCategoryDom()
        vi.spyOn(window, "alert").mockImplementation(() => {})
    })

    it("adds a new category", async () => {
        new CategoryView()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText("Category title"), "Shoes")
        await user.type(screen.getByLabelText("Category description"), "Footwear items")
        await user.click(screen.getByRole("button", { name: /add category/i }))

        const savedCategories = Storage.getCategories()
        expect(savedCategories).toHaveLength(1)
        expect(savedCategories[0]).toMatchObject({
            title: "Shoes",
            description: "Footwear items",
        })
        expect(screen.getByRole("option", { name: "Shoes" })).toBeInTheDocument()
    })

    it("updates an existing category description instead of duplicating", async () => {
        Storage.saveCategories([
            {
                id: 1,
                title: "Shoes",
                description: "Old description",
                createdAt: "2026-01-01T00:00:00.000Z",
            },
        ])
        const categoryView = new CategoryView()
        categoryView.setupApp()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText("Category title"), "Shoes")
        await user.type(screen.getByLabelText("Category description"), "Updated description")
        await user.click(screen.getByRole("button", { name: /add category/i }))

        const savedCategories = Storage.getCategories()
        expect(savedCategories).toHaveLength(1)
        expect(savedCategories[0].description).toBe("Updated description")
        expect(window.alert).toHaveBeenCalledWith(
            "this category name has been added before so we will update the category description!"
        )
    })

    it("trims category names before saving", async () => {
        new CategoryView()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText("Category title"), "  Shoes  ")
        await user.type(screen.getByLabelText("Category description"), "Trimmed title")
        await user.click(screen.getByRole("button", { name: /add category/i }))

        const savedCategories = Storage.getCategories()
        expect(savedCategories).toHaveLength(1)
        expect(savedCategories[0].title).toBe("Shoes")
        expect(screen.getByRole("option", { name: "Shoes" })).toBeInTheDocument()
    })

    it("matches categories case-insensitively", async () => {
        Storage.saveCategories([
            {
                id: 1,
                title: "Shoes",
                description: "Original description",
                createdAt: "2026-01-01T00:00:00.000Z",
            },
        ])
        new CategoryView()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText("Category title"), "sHoEs")
        await user.type(screen.getByLabelText("Category description"), "Case-insensitive update")
        await user.click(screen.getByRole("button", { name: /add category/i }))

        const savedCategories = Storage.getCategories()
        expect(savedCategories).toHaveLength(1)
        expect(savedCategories[0].description).toBe("Case-insensitive update")
    })

    it("persists category changes to localStorage", async () => {
        new CategoryView()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText("Category title"), "Bags")
        await user.type(screen.getByLabelText("Category description"), "Bag products")
        await user.click(screen.getByRole("button", { name: /add category/i }))

        expect(localStorage.setItem).toHaveBeenCalledWith("categories", expect.any(String))
        expect(JSON.parse(localStorage.getItem("categories"))).toHaveLength(1)
    })

    it("shows validation alert and does not persist when category title is too short", async () => {
        new CategoryView()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText("Category title"), "a")
        await user.click(screen.getByRole("button", { name: /add category/i }))

        expect(window.alert).toHaveBeenCalledWith(
            "your entered title for category must be at least 2 characters!!!"
        )
        expect(Storage.getCategories()).toHaveLength(0)
    })

    it("resets category inputs when cancel is clicked", async () => {
        new CategoryView()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText("Category title"), "Shoes")
        await user.type(screen.getByLabelText("Category description"), "Footwear")
        await user.click(screen.getByRole("button", { name: /cancel/i }))

        expect(screen.getByLabelText("Category title")).toHaveValue(" ")
        expect(screen.getByLabelText("Category description")).toHaveValue(" ")
    })

    it("excludes blank category titles from dropdown rendering", () => {
        const categoryView = new CategoryView()
        categoryView.instantCtgUpdate([
            { title: "   " },
            { title: "Shoes" },
        ])

        const categoryOptions = [...document.querySelectorAll("#categoriesSelect option")].map(
            (option) => option.textContent
        )
        expect(categoryOptions).toEqual(["- select category -", "Shoes"])
    })
})
