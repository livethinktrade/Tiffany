#!/usr/bin/env python3
"""
Migrate N8N workflow from Telegram nodes to HTTP Request nodes for ClawdBot integration.
"""

import json
import uuid

# Configuration
TELEGRAM_TOKEN = "8161323254:AAFnWrxVwdQris3IpYg1YMVZ0evzCL6Oo-g"
CHAT_ID = "7286534686"
TELEGRAM_BASE_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

def create_http_request_node(telegram_node):
    """Convert a Telegram node to an HTTP Request node."""

    # Extract parameters from telegram node
    text_param = telegram_node["parameters"].get("text", "")
    chat_id_param = telegram_node["parameters"].get("chatId", f"={CHAT_ID}")
    additional_fields = telegram_node["parameters"].get("additionalFields", {})

    # Determine the method (sendMessage or sendPhoto)
    # For now, we only have sendMessage nodes
    method = "sendMessage"

    # Process chat_id - remove leading = if present
    if chat_id_param.startswith("="):
        chat_id_value = chat_id_param[1:]
    else:
        chat_id_value = chat_id_param

    # Process text - remove leading = if present
    if text_param.startswith("="):
        text_value = text_param[1:]
    else:
        text_value = text_param

    # Build JSON body as a string with proper n8n expression syntax
    json_body = "{\n"
    json_body += f'  "chat_id": {chat_id_value},\n'
    json_body += f'  "text": {text_value}'

    # Add parse_mode if present
    parse_mode = additional_fields.get("parseMode", "")
    if parse_mode:
        json_body += f',\n  "parse_mode": "{parse_mode}"'

    json_body += "\n}"

    # Create HTTP Request node
    http_node = {
        "parameters": {
            "method": "POST",
            "url": f"{TELEGRAM_BASE_URL}/{method}",
            "authentication": "none",
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": json_body
        },
        "id": telegram_node["id"],  # Keep same ID to preserve connections
        "name": telegram_node["name"],
        "type": "n8n-nodes-base.httpRequest",
        "position": telegram_node["position"],
        "typeVersion": 4.2,
        "alwaysOutputData": telegram_node.get("alwaysOutputData", True),
        "onError": telegram_node.get("onError", "continueErrorOutput")
    }

    # Remove disabled flag if present
    if "disabled" in telegram_node:
        http_node["disabled"] = telegram_node["disabled"]

    return http_node

def migrate_workflow(original_workflow):
    """Migrate the workflow from Telegram nodes to HTTP Request nodes."""

    # Create a deep copy of the workflow
    new_workflow = json.loads(json.dumps(original_workflow))

    # Change the workflow name
    new_workflow["name"] = "Tiffany_Obsidian_ClawdBot"

    # Remove ID (will be assigned by N8N)
    if "id" in new_workflow:
        del new_workflow["id"]

    # Remove timestamps
    if "createdAt" in new_workflow:
        del new_workflow["createdAt"]
    if "updatedAt" in new_workflow:
        del new_workflow["updatedAt"]

    # Remove version info
    if "versionId" in new_workflow:
        del new_workflow["versionId"]
    if "versionCounter" in new_workflow:
        del new_workflow["versionCounter"]

    # Remove shared info (will be set by N8N)
    if "shared" in new_workflow:
        del new_workflow["shared"]

    # Replace Telegram nodes with HTTP Request nodes
    for i, node in enumerate(new_workflow["nodes"]):
        if node["type"] == "n8n-nodes-base.telegram":
            print(f"Converting Telegram node: {node['name']} (ID: {node['id']})")
            new_workflow["nodes"][i] = create_http_request_node(node)

    return new_workflow

def main():
    # Load original workflow
    input_file = "/mnt/d/Program Files/Obsidian/projects/P2_tiffany-pai-project/n8n-workflows/Tiffany_Obsidian_Schedule_W0Q5EZNOiDQZtKYp_ORIGINAL.json"

    with open(input_file, 'r') as f:
        original_workflow = json.load(f)

    print(f"Loaded workflow: {original_workflow['name']}")
    print(f"Total nodes: {len(original_workflow['nodes'])}")

    # Find Telegram nodes
    telegram_nodes = [n for n in original_workflow['nodes'] if n['type'] == 'n8n-nodes-base.telegram']
    print(f"Found {len(telegram_nodes)} Telegram nodes to convert")

    # Migrate workflow
    new_workflow = migrate_workflow(original_workflow)

    # Save migrated workflow locally first
    output_file = "/mnt/d/Program Files/Obsidian/projects/P2_tiffany-pai-project/n8n-workflows/Tiffany_Obsidian_ClawdBot_MIGRATED.json"
    with open(output_file, 'w') as f:
        json.dump(new_workflow, f, indent=2)

    print(f"\nMigrated workflow saved to: {output_file}")
    print(f"New workflow name: {new_workflow['name']}")

    return new_workflow

if __name__ == "__main__":
    migrated = main()
