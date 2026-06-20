# CRM OS Data Dictionary Canon v1

## Global Field Standard

| Field | Type | Required | Description |
|---|---|---:|---|
| id | uuid | yes | Primary key |
| tenant_id | uuid | yes | Tenant isolation |
| created_at | timestamptz | yes | Creation time |
| created_by | uuid | no | Actor user |
| updated_at | timestamptz | no | Update time |
| updated_by | uuid | no | Update actor |
| deleted_at | timestamptz | no | Soft delete time |
| deleted_by | uuid | no | Delete actor |
| version | int | yes | Optimistic locking |

## Core Dictionary Highlights

### tenants

| Field | Type | Required |
|---|---|---:|
| id | uuid | yes |
| name | varchar(255) | yes |
| slug | varchar(100) | yes |
| plan_id | uuid | no |
| status | varchar(30) | yes |
| default_currency | varchar(3) | yes |
| timezone | varchar(80) | yes |
| locale | varchar(10) | yes |

### users

| Field | Type | Required |
|---|---|---:|
| id | uuid | yes |
| tenant_id | uuid | yes |
| email | varchar(255) | yes |
| phone | varchar(50) | no |
| password_hash | text | no |
| first_name | varchar(100) | yes |
| last_name | varchar(100) | yes |
| status | varchar(30) | yes |
| branch_id | uuid | no |
| department_id | uuid | no |
| manager_id | uuid | no |

### customers

| Field | Type | Required |
|---|---|---:|
| id | uuid | yes |
| tenant_id | uuid | yes |
| customer_type | varchar(30) | yes |
| code | varchar(80) | no |
| company_name | varchar(255) | no |
| first_name | varchar(100) | no |
| last_name | varchar(100) | no |
| tax_number | varchar(50) | no |
| email | varchar(255) | no |
| phone | varchar(50) | no |
| source | varchar(100) | no |
| segment_id | uuid | no |
| status | varchar(30) | yes |
| assigned_user_id | uuid | no |
| branch_id | uuid | no |
| dealer_id | uuid | no |
| credit_limit | numeric(18,2) | no |
| risk_score | numeric(5,2) | no |
| lifetime_value | numeric(18,2) | no |

### leads

| Field | Type | Required |
|---|---|---:|
| id | uuid | yes |
| tenant_id | uuid | yes |
| full_name | varchar(255) | no |
| company_name | varchar(255) | no |
| email | varchar(255) | no |
| phone | varchar(50) | no |
| source_id | uuid | no |
| status | varchar(40) | yes |
| score | int | yes |
| temperature | varchar(20) | no |
| assigned_user_id | uuid | no |
| customer_id | uuid | no |
| opportunity_id | uuid | no |
| converted_at | timestamptz | no |
| lost_reason_id | uuid | no |

### opportunities

| Field | Type | Required |
|---|---|---:|
| id | uuid | yes |
| tenant_id | uuid | yes |
| customer_id | uuid | yes |
| lead_id | uuid | no |
| pipeline_id | uuid | yes |
| stage_id | uuid | yes |
| title | varchar(255) | yes |
| amount | numeric(18,2) | yes |
| currency | varchar(3) | yes |
| probability | numeric(5,2) | no |
| expected_close_date | date | no |
| status | varchar(30) | yes |
| assigned_user_id | uuid | no |

### quotes

| Field | Type | Required |
|---|---|---:|
| id | uuid | yes |
| tenant_id | uuid | yes |
| quote_no | varchar(80) | yes |
| customer_id | uuid | yes |
| opportunity_id | uuid | no |
| status | varchar(40) | yes |
| currency | varchar(3) | yes |
| subtotal_amount | numeric(18,2) | yes |
| discount_amount | numeric(18,2) | yes |
| tax_amount | numeric(18,2) | yes |
| total_amount | numeric(18,2) | yes |
| valid_until | date | no |

### orders

| Field | Type | Required |
|---|---|---:|
| id | uuid | yes |
| tenant_id | uuid | yes |
| order_no | varchar(80) | yes |
| customer_id | uuid | yes |
| quote_id | uuid | no |
| status | varchar(40) | yes |
| currency | varchar(3) | yes |
| subtotal_amount | numeric(18,2) | yes |
| tax_amount | numeric(18,2) | yes |
| total_amount | numeric(18,2) | yes |
| expected_delivery_date | date | no |

## Dictionary Rule

Detailed table-level dictionaries may live in `docs/database/data-dictionary-v1.md`, but the field naming and global standards in this canon override older files.
