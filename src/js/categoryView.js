import Storage from "./storage.js";

export default class CategoryView {
    constructor() {
        // variables
        this.ctgTitleInput = document.querySelector("#categoryTitle")
        this.ctgDescInput = document.querySelector("#categoryDescription")
        this.ctgCancelBtn = document.querySelector("#categoryCanelBtn")
        this.ctgAddBtn = document.querySelector("#categoryAddNewBtn")
        this.ctgSelect = document.querySelector("#categoriesSelect")
        // event listeners
        this.ctgAddBtn.addEventListener("click", () => {
            this.addNewCategory()
        })
        this.ctgCancelBtn.addEventListener("click", () => {
            this.resetCategoryInputs()
        })
    }

    setupApp() {
        this.instantCtgUpdate(Storage.getCategories())
    }

    normalizeCategoryTitle(title) {
        return (title || "").trim()
    }

    getCategoryTitleKey(title) {
        return this.normalizeCategoryTitle(title).toLowerCase()
    }

    resetCategoryInputs() {
        this.ctgTitleInput.value = ' '
        this.ctgDescInput.value = ' '
    }

    buildCategory(title, description) {
        return {
            id: new Date().getTime(),
            title,
            description,
            createdAt: new Date().toISOString(),
        }
    }

    findCategoryByTitleKey(categories, titleKey) {
        return categories.find((category) => this.getCategoryTitleKey(category.title) === titleKey)
    }

    persistAndRefreshCategories(categories) {
        Storage.saveCategories(categories)
        this.instantCtgUpdate(categories)
    }

    addNewCategory() {
        const normalizedTitle = this.normalizeCategoryTitle(this.ctgTitleInput.value)
        const normalizedTitleKey = this.getCategoryTitleKey(normalizedTitle)
        if (normalizedTitle.length >= 2) {
            const categoryDescription = this.ctgDescInput.value
            this.resetCategoryInputs()
            // save category to local storage
            const savedCategories = Storage.getCategories()
            // edit => ... save
            // new => ... save
            const existingCategory = this.findCategoryByTitleKey(savedCategories, normalizedTitleKey)
            if (existingCategory) {
                // edit
                existingCategory.title = normalizedTitle
                existingCategory.description = categoryDescription
                alert("this category name has been added before so we will update the category description!")
            } else {
                // new
                const newCategory = this.buildCategory(normalizedTitle, categoryDescription)
                savedCategories.push(newCategory)
            }
            this.persistAndRefreshCategories(savedCategories)
        } else {
            alert("your entered title for category must be at least 2 characters!!!")
        }
    }

    instantCtgUpdate(categories) {
        const ctgListTitles = categories
            .map(obj => (obj.title || "").trim())
            .filter(Boolean)
        // create option for each category
        this.ctgSelect.innerHTML = ` <option selected value="none" data-i18n="selectCategory">- select category -</option> `
        ctgListTitles.forEach((option) => {
            const newOption = document.createElement("option")
            newOption.value = option
            newOption.textContent = option
            // append new created option to select tg
            this.ctgSelect.append(newOption)
        })
    if (typeof window.updateLanguage === 'function') {
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            window.updateLanguage(currentLang);
        }
    
    }

}
