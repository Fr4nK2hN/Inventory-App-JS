import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./src/js/test/setup.js"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json", "json-summary", "lcov"],
            reportsDirectory: "./coverage",
            include: ["src/js/**/*.js"],
            exclude: ["src/js/app.js"],
        },
    },
})
