.PHONY:
help:
	@echo Tasks:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# DEVELOPMENT SETUP
dev: ## Run Mainlink Portal Web development server
	bun run dev

build: ## Build Mainlink Portal Web application
	bun run build

serve: ## Build production version of Mainlink Portal Web application and start the server
	NODE_ENV=production bun run start

clean-files: ## Remove all generated files
	rm -rf node_modules \
		node_modules dist && \
		bun install

lint: ## Run linters
	bun run lint

routes: ## Generate routes
	bun run routes:generate
