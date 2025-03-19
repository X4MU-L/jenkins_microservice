# Load the .env file
ENV_FILE = .env

include $(ENV_FILE)
export $(shell sed 's/=.*//' .env)  # Export all variables

# Define variables
SSH_FOLDER_PATH ?= ~/.ssh
SSH_USER ?= ubuntu
SSH_KEY_NAME ?= ${APP_NAME}-key.pem
TERRAFORM_DIR = terraform
ANSIBLE_DIR = ansible
TFVARS_FILE = $(TERRAFORM_DIR)/terraform.tfvars



# Target to copy .env to terraform.tfvars
.PHONY: copy-env
copy-env:
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

	@terraform -chdir=./terraform fmt

# Target to run Terraform
.PHONY: terraform
terraform: copy-env
	@echo "🚀 Running Terraform..."
	@cd $(TERRAFORM_DIR) && terraform validate && \
	 terraform init && terraform plan && \
	 terraform apply -auto-approve

# Target to run Ansible
.PHONY: ansible
ansible:
	@echo "🔧 Running Ansible Playbook..."
	@cd $(ANSIBLE_DIR) && ansible-playbook playbook.yml \
	--tags jenkins --private-key="$(SSH_FOLDER_PATH)/$(SSH_KEY_NAME)" -u $(SSH_USER)

# Target to run both Terraform & Ansible
.PHONY: deploy
deploy: terraform ansible
	@echo "✅ Deployment complete!"
