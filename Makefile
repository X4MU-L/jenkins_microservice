# Load the .env file
ENV_FILE = .env
ENV_EXAMPLE_FILE = .env.example

include $(ENV_FILE)
export $(shell sed -n 's/=.*//p' $(ENV_FILE))  # Export all variables

# Define variables
SSH_FOLDER_PATH ?= ~/.ssh
SSH_USER ?= ubuntu
SSH_KEY_NAME ?= $(APP_NAME)-key.pem
TERRAFORM_DIR = terraform
ANSIBLE_DIR = ansible
TFVARS_FILE = $(TERRAFORM_DIR)/terraform.tfvars
BACKUP_TFVARS = $(TERRAFORM_DIR)/terraform.tfvars.bak
GIT_URL_SSH = git@github.com:$(GITHUB_USERNAME)/$(GITHUB_REPO_NAME).git
GIT_URL_HTTPS = https://github.com/$(GITHUB_USERNAME)/$(GITHUB_REPO_NAME).git

# Validate .env file against .env.example
.PHONY: validate-env
validate-env:
	@echo "🔍 Validating environment variables..."
	@if [ ! -f $(ENV_EXAMPLE_FILE) ]; then \
		echo "❌ Error: $(ENV_EXAMPLE_FILE) file not found!"; \
		exit 1; \
	fi; \
	if [ ! -f $(ENV_FILE) ]; then \
		echo "❌ Error: $(ENV_FILE) file not found!"; \
		exit 1; \
	fi; \
	@errors=0; \
	while IFS='=' read -r key value; do \
		key=$$(echo "$$key" | tr -d '[:space:]'); \
		[ -z "$$key" ] || [[ "$$key" == \#* ]] && continue; \
		actual_value=$$(grep -E "^$$key=" .env | cut -d'=' -f2- | tr -d '"'); \
		if [ -z "$$actual_value" ]; then \
			echo "❌ Missing or empty key: $$key"; errors=1; \
		fi; \
	done < .env.example; \
	if [ $$errors -eq 1 ]; then \
		echo "❌ Environment validation failed!"; exit 1; \
	else \
		echo "✅ Environment validation passed!"; \
	fi

# Backup and restore Terraform tfvars
.PHONY: backup-tfvars restore-tfvars
backup-tfvars:
	@if [ -f $(TFVARS_FILE) ]; then \
		echo "📂 Backing up $(TFVARS_FILE)..."; \
		cp $(TFVARS_FILE) $(BACKUP_TFVARS); \
	fi

restore-tfvars:
	@if [ -f $(BACKUP_TFVARS) ]; then \
		echo "📂 Restoring $(TFVARS_FILE) from backup..."; \
		mv $(BACKUP_TFVARS) $(TFVARS_FILE); \
	else \
		echo "⚠️ No backup found."; \
	fi

# Copy .env to terraform.tfvars
.PHONY: copy-env
copy-env: backup-tfvars
	@echo "📂 Checking for existing variables in $(TFVARS_FILE)..."
	@while IFS='=' read -r key value; do \
		key=$$(echo "$$key" | tr -d '[:space:]'); \
		if [ -n "$$key" ] && ! grep -qE "^[[:space:]]*$$key[[:space:]]*=" $(TFVARS_FILE) 2>/dev/null; then \
			echo "$$key not found. Appending..."; \
			echo "$$key=$$value" >> $(TFVARS_FILE); \
		else \
			echo "✅ $$key already exists. Skipping."; \
		fi \
	done < $(ENV_FILE)
	@terraform -chdir=$(TERRAFORM_DIR) fmt

# Run Terraform
.PHONY: terraform
terraform: validate-env copy-env
	@echo "🚀 Running Terraform..."
	@cd $(TERRAFORM_DIR) && terraform init && terraform validate && terraform apply -auto-approve

# Target to run Ansible
.PHONY: ansible
ansible: validate-env
	@echo "🔧 Running Ansible Playbook..."
	@echo "$(NODE_PORT), $(CONTAINER_PORT), $(JENKINS_SSH_PORT), $(SSH_NODE_PORT), $(AGENT_PORT), $(AGENT_NODE_PORT)"
	@cd $(ANSIBLE_DIR) && ansible-playbook playbook.yml \
	--tags jenkins --private-key="$(SSH_FOLDER_PATH)/$(SSH_KEY_NAME)" -u $(SSH_USER) \
	-e git_branch="main" \
	-e jenkinsfile_path="Jenkinsfile" \
	-e dockerhub_username="$(DOCKER_USERNAME)" \
	-e dockerhub_password="$(DOCKER_PASSWORD)" \
	-e jenkins_namespace="$(JENKINS_NAMESPACE)" \
	-e container_port="$(CONTAINER_PORT)" \
	-e node_port="$(NODE_PORT)" \
	-e jenkins_ssh_port="$(JENKINS_SSH_PORT)" \
	-e ssh_node_port="$(SSH_NODE_PORT)" \
	-e agent_port="$(AGENT_PORT)" \
	-e agent_node_port="$(AGENT_NODE_PORT)" \
	-e github_username="$(GITHUB_USERNAME)" \
	-e github_access_token="$(GITHUB_ACCESS_TOKEN)" \
	-e github_repo_name="$(GITHUB_REPO_NAME)" \
	-e github_ssh_key_name="$(GITHUB_SSH_KEY_FILE_NAME)" \
	-e secret_name_volume_key="$(SECRET_NAME_VOLUME_KEY)" \
	-e app_name="$(APP_NAME)" \
	-e jenkins_admin_password="$(JENKINS_ADMIN_PASSWORD)" \
	-e jenkins_admin_username="$(JENKINS_ADMIN_USERNAME)"

# Push changes to GitHub
.PHONY: push-to-github
push-to-github:
	@echo "🔄 Pushing changes to GitHub..."
	
	@git push $(GIT_URL_SSH) || git push $(GIT_URL_HTTPS)

# Full Deployment
.PHONY: deploy
deploy: terraform ansible restore-tfvars push-to-github
	@echo "✅ Deployment complete!"

# Cleanup
.PHONY: clean
clean: restore-tfvars
	@echo "🧹 Cleaning up..."
	@cd $(TERRAFORM_DIR) && terraform destroy -auto-approve || true
	@rm -f $(BACKUP_TFVARS)
	@echo "✅ Cleanup complete!"
