# CRM OS Custom Modules Canon

## Purpose

Custom modules allow tenants to model additional business objects without changing core source code.

## Canonical Tables

- custom_modules
- custom_module_fields
- custom_module_records
- custom_module_record_values

## Rules

- Custom modules are tenant-scoped.
- Custom modules cannot override core modules.
- Custom module records must support audit, comments, files, tags, and timeline.
- Custom modules must expose generated list/detail/create/edit UI through safe metadata.
- API access requires explicit permission scopes.
