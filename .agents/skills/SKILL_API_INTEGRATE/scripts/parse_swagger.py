#!/usr/bin/env python3
"""
parse_swagger.py — Swagger/OpenAPI Parser for API_Backend_Integrator

Usage:
  python3 parse_swagger.py --url https://dev-api-larko.driveapp.work/openapi.json
  python3 parse_swagger.py --file swagger.json
  python3 parse_swagger.py --url <URL> --screen my_tasks
  python3 parse_swagger.py --url <URL> --tags timelogs,orders

Output:
  Prints a Markdown Endpoint Map table ready to paste into IMPLEMENTED_API_[SCREEN].md

Dependencies:
  pip install requests pyyaml
"""

import argparse
import json
import sys
import urllib.request
from typing import Optional


def fetch_swagger(url: str) -> dict:
    """Fetch OpenAPI JSON from a URL."""
    # Try /openapi.json first, then /docs/openapi.json for FastAPI
    candidates = [url]
    if url.endswith('/docs'):
        candidates = [url.replace('/docs', '/openapi.json'), url]
    elif not url.endswith('.json') and not url.endswith('.yaml'):
        candidates = [url.rstrip('/') + '/openapi.json', url]

    for candidate in candidates:
        try:
            print(f"[parse_swagger] Fetching: {candidate}", file=sys.stderr)
            with urllib.request.urlopen(candidate, timeout=10) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except Exception as e:
            print(f"[parse_swagger] Failed {candidate}: {e}", file=sys.stderr)
            continue

    raise RuntimeError(f"Could not fetch Swagger JSON from {url}")


def load_swagger(path: str) -> dict:
    """Load OpenAPI JSON/YAML from a local file."""
    with open(path, 'r') as f:
        content = f.read()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        try:
            import yaml
            return yaml.safe_load(content)
        except ImportError:
            raise RuntimeError("Install pyyaml to parse YAML: pip install pyyaml")


def extract_endpoints(spec: dict, filter_tags: Optional[list] = None,
                       filter_screen: Optional[str] = None) -> list[dict]:
    """Extract all endpoints from the OpenAPI spec."""
    endpoints = []
    paths = spec.get('paths', {})

    for path, path_item in paths.items():
        for method in ['get', 'post', 'put', 'patch', 'delete']:
            operation = path_item.get(method)
            if not operation:
                continue

            tags = operation.get('tags', [])
            operation_id = operation.get('operationId', '')
            summary = operation.get('summary', '')
            description = operation.get('description', '')

            # Filter by tags
            if filter_tags and not any(t.lower() in [ft.lower() for ft in filter_tags] for t in tags):
                continue

            # Filter by screen name (loose match on path/tags/operationId)
            if filter_screen:
                screen_lower = filter_screen.lower().replace('_', '')
                matches = any(screen_lower in str(t).lower().replace('_', '') for t in
                              [path, operation_id, summary, *tags])
                if not matches:
                    continue

            # Extract request body schema name
            request_model = ''
            req_body = operation.get('requestBody', {})
            if req_body:
                content = req_body.get('content', {})
                json_content = content.get('application/json', {})
                schema = json_content.get('schema', {})
                ref = schema.get('$ref', '')
                if ref:
                    request_model = ref.split('/')[-1]
                elif schema.get('type'):
                    request_model = f"inline ({schema['type']})"

            # Extract response schema name (200 or 201)
            response_model = ''
            responses = operation.get('responses', {})
            for status in ['200', '201']:
                resp = responses.get(status, {})
                content = resp.get('content', {})
                json_content = content.get('application/json', {})
                schema = json_content.get('schema', {})
                if schema:
                    ref = schema.get('$ref', '')
                    if ref:
                        response_model = ref.split('/')[-1]
                    elif schema.get('type') == 'array':
                        items_ref = schema.get('items', {}).get('$ref', '')
                        if items_ref:
                            response_model = f"List<{items_ref.split('/')[-1]}>"
                    elif schema.get('type'):
                        response_model = f"inline ({schema['type']})"
                    break

            endpoints.append({
                'method': method.upper(),
                'path': path,
                'operation_id': operation_id,
                'summary': summary,
                'tags': ', '.join(tags),
                'request_model': request_model or '—',
                'response_model': response_model or '—',
            })

    return endpoints


def print_endpoint_map(endpoints: list[dict]) -> None:
    """Print a Markdown table for the Endpoint Map."""
    if not endpoints:
        print("No matching endpoints found.")
        return

    print("## §Endpoint Map\n")
    print("| Flow Action | HTTP Method | Path | Swagger operationId | Request Model | Response Model | Status |")
    print("|---|---|---|---|---|---|---|")

    for ep in endpoints:
        summary = ep['summary'] or ep['operation_id'] or ep['path']
        print(
            f"| {summary} "
            f"| {ep['method']} "
            f"| {ep['path']} "
            f"| {ep['operation_id']} "
            f"| {ep['request_model']} "
            f"| {ep['response_model']} "
            f"| 🔲 Pending |"
        )

    print(f"\n> **Total**: {len(endpoints)} endpoint(s)")


def main():
    parser = argparse.ArgumentParser(description='Parse Swagger/OpenAPI for API integration.')
    parser.add_argument('--url', help='Swagger UI or OpenAPI JSON URL')
    parser.add_argument('--file', help='Local OpenAPI JSON/YAML file path')
    parser.add_argument('--screen', help='Filter by screen name (loose match)', default=None)
    parser.add_argument('--tags', help='Comma-separated tags to filter', default=None)
    args = parser.parse_args()

    if not args.url and not args.file:
        print("Error: provide --url or --file", file=sys.stderr)
        sys.exit(1)

    try:
        if args.url:
            spec = fetch_swagger(args.url)
        else:
            spec = load_swagger(args.file)

        filter_tags = [t.strip() for t in args.tags.split(',')] if args.tags else None
        endpoints = extract_endpoints(spec, filter_tags=filter_tags, filter_screen=args.screen)
        print_endpoint_map(endpoints)

    except Exception as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
