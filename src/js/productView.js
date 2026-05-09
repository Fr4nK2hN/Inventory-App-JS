import Storage from "./storage.js";

export default class ProductView {
    constructor() {
        // variables
        this.pdtTitle = document.querySelector("#productTitle")
        this.pdtIncQty = document.querySelector("#incQty")
        this.pdtDecQty = document.querySelector("#decQty")
        this.pdtLocation = document.querySelector("#productLocations")
        this.ctgSelect = document.querySelector("#categoriesSelect")
        this.pdtAddNew = document.querySelector("#addNewProductBtn")
        this.pdtQty = document.querySelector("#productQuantity")
        this.productCenter = document.querySelector("#productsCenter")
        this.toggleBtns = document.querySelectorAll(".toggleBtn")
        this.searchInput = document.querySelector("#searchInput")
        this.sortSelect = document.querySelector("#sort")
        this.searchTerm = ""
        this.currentSortType = this.sortSelect.value
        // event listeners
        this.pdtAddNew.addEventListener("click", () => {
            this.addNewProduct()
        })
        this.toggleBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.toggleProductQty(e)
            })
        })
        this.searchInput.addEventListener("keyup", (e) => {
            this.searchProducts(e.target.value)
        })
        this.sortSelect.addEventListener("change", (e) => {
            this.sortBySelect(e.target.value)
        })
    }

    setupApp() {
        this.syncViewStateFromControls()
        this.refreshProductsList()
    }

    getAllProducts() {
        return Storage.getProducts
    }

    syncViewStateFromControls() {
        this.searchTerm = this.searchInput.value
        this.currentSortType = this.sortSelect.value
    }

    normalizeSearchTerm(searchTerm) {
        return (searchTerm || "").toLowerCase().trim()
    }

    normalizeProductTitle(title) {
        return (title || "").toLowerCase().trim()
    }

    compareByTitle(a, b) {
        return this.normalizeProductTitle(a.title).localeCompare(this.normalizeProductTitle(b.title))
    }

    getSortComparator(sortType) {
        const comparators = {
            newest: (a, b) => b.id - a.id,
            oldest: (a, b) => a.id - b.id,
            "A-Z": (a, b) => this.compareByTitle(a, b),
            "Z-A": (a, b) => this.compareByTitle(b, a),
        }
        return comparators[sortType] || null
    }

    matchesSearchTerm(product, normalizedSearchTerm) {
        return this.normalizeProductTitle(product.title).includes(normalizedSearchTerm)
    }

    filterProducts(products, searchTerm) {
        const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm)
        if (!normalizedSearchTerm) {
            return products.slice()
        }
        return products.filter((product) => this.matchesSearchTerm(product, normalizedSearchTerm))
    }

    sortProducts(products, sortType) {
        const comparator = this.getSortComparator(sortType)
        if (!comparator) {
            return products.slice()
        }
        return products.slice().sort(comparator)
    }

    deriveVisibleProducts(products, searchTerm, sortType) {
        const filteredProducts = this.filterProducts(products, searchTerm)
        return this.sortProducts(filteredProducts, sortType)
    }

    refreshProductsList() {
        const allProducts = this.getAllProducts()
        const finalProducts = this.deriveVisibleProducts(allProducts, this.searchTerm, this.currentSortType)
        this.showListedProducts(finalProducts)
    }

    resetProductInputs() {
        this.pdtTitle.value = " "
        this.pdtQty.innerText = 0
        this.pdtLocation.value = "none"
        this.ctgSelect.value = "none"
    }

    buildProduct() {
        return {
            id: new Date().getTime(),
            title: this.pdtTitle.value.trim(),
            quantity: this.pdtQty.innerText,
            location: this.pdtLocation.value,
            category: this.ctgSelect.value,
            persianDate: new Date().toLocaleDateString("fa-IR"),
        }
    }

    addNewProduct() {
        if (this.pdtTitle.value.trim().length >= 2) {
            const newProduct = this.buildProduct()
            this.resetProductInputs()
            // save product to local storage
            const savedProducts = Storage.getProducts
            savedProducts.push(newProduct)
            Storage.saveProducts(savedProducts)
            // instant update html product list from storage
            this.refreshProductsList()

        } else {
            alert("your entered title for category must be at least 2 characters!!!")
        }

    }

    showListedProducts(productList) {
        this.productCenter.replaceChildren(...productList.map((product) => this.createProductListItem(product)))
        this.productsAction()
    }

    createProductListItem(product) {
        const listItem = document.createElement("li")
        listItem.className = "flex items-center justify-between  w-full py-2 bg-blue-400/ text-white font-medium ss:min-w-[500px] ss:overflow-x-auto "

        listItem.append(
            this.createTextColumn(product.title),
            this.createTextColumn(product.location),
            this.createTextColumn(product.category),
            this.createTextColumn(product.persianDate, "font-vazir"),
            this.createQuantityColumn(product.quantity),
            this.createDeleteIcon(product.id)
        )

        return listItem
    }

    createTextColumn(value, extraClass = "") {
        const column = document.createElement("p")
        column.className = `basis-[16%] ww:text-base xx:text-[15px] dd:text-[14px] ss:text-[13px] ${extraClass}`.trim()
        column.textContent = value ?? ""
        return column
    }

    createQuantityColumn(value) {
        const column = document.createElement("p")
        column.className = "border-2 border-slate-400 p-1 rounded-2xl ww:text-base xx:text-[15px] dd:text-[14px] ss:text-[13px] "
        column.textContent = value ?? ""
        return column
    }

    createDeleteIcon(productId) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.id = String(productId)
        svg.classList.add("pdt-dlt-btn", "stroke-red-500", "dd:h-6", "dd:w-6", "ss:h-5", "ss:w-5", "cursor-pointer")
        svg.setAttribute("fill", "none")
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.setAttribute("stroke-width", "1.5")
        svg.setAttribute("stroke", "currentColor")

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        path.setAttribute("stroke-linecap", "round")
        path.setAttribute("stroke-linejoin", "round")
        path.setAttribute("d", "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0")

        svg.append(path)
        return svg
    }

    productsAction() {
        // delete product event listener
        const removeButtons = [...document.querySelectorAll(".pdt-dlt-btn")]
        removeButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this.deleteProduct(e)
            })
        })
    }

    toggleProductQty(e) {
        switch (e.currentTarget.id) {
            case "incQty":
                this.pdtQty.innerText++;
                break;
            case "decQty":
                this.pdtQty.innerText--;
                break;
        }
    }

    deleteProduct(e) {
        const productId = Number(e.currentTarget.id)
        Storage.removeProduct(productId)
        this.syncViewStateFromControls()
        this.refreshProductsList()
    }

    searchProducts(searchTerm) {
        this.searchTerm = searchTerm
        this.refreshProductsList()
    }

    sortBySelect(sortType) {
        this.currentSortType = sortType
        this.refreshProductsList()
    }

}
