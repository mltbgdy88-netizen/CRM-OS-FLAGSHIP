# CRM OS RLS Policy v1

Source: extracted from CRM OS PostgreSQL Schema v1 and Security & Compliance Blueprint v1.

Aşağıda 
CRM OS PostgreSQL Schema v1
 çekirdek migration paketi var. İlk sürüm için 
CORE + IAM + CRM + LEAD + SALES + QUOTE + TASK + COMMON
 omurgasını kurar.


SQL
-- =========================================================
-- CRM OS PostgreSQL Schema v1
-- Target: PostgreSQL 15+
-- =========================================================
CREATE
 EXTENSION 
IF
 
NOT
 
EXISTS
 
"uuid-ossp"
;
CREATE
 EXTENSION 
IF
 
NOT
 
EXISTS
 pgcrypto;
-- =========================================================
-- 0. CORE
-- =========================================================
CREATE
 
TABLE
 tenants (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    name 
VARCHAR
(
255
) 
NOT
 
NULL
,
    slug 
VARCHAR
(
100
) 
NOT
 
NULL
 
UNIQUE
,
    status 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'active'
,
    default_currency 
VARCHAR
(
3
) 
NOT
 
NULL
 
DEFAULT
 
'TRY'
,
    timezone 
VARCHAR
(
80
) 
NOT
 
NULL
 
DEFAULT
 
'Europe/Istanbul'
,
    locale 
VARCHAR
(
10
) 
NOT
 
NULL
 
DEFAULT
 
'tr-TR'
,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 tenant_settings (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    
key
 
VARCHAR
(
150
) 
NOT
 
NULL
,
    
value
 JSONB,
    is_encrypted 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
FALSE
,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    
UNIQUE
 (tenant_id, 
key
)
);
CREATE
 
TABLE
 plans (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    code 
VARCHAR
(
50
) 
NOT
 
NULL
 
UNIQUE
,
    name 
VARCHAR
(
100
) 
NOT
 
NULL
,
    monthly_price 
NUMERIC
(
18
,
2
),
    yearly_price 
NUMERIC
(
18
,
2
),
    is_active 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
TRUE
);
-- =========================================================
-- 1. IAM
-- =========================================================
CREATE
 
TABLE
 branches (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    name 
VARCHAR
(
150
) 
NOT
 
NULL
,
    code 
VARCHAR
(
50
),
    address TEXT,
    city 
VARCHAR
(
100
),
    status 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'active'
,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 departments (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    name 
VARCHAR
(
150
) 
NOT
 
NULL
,
    parent_id UUID 
REFERENCES
 departments(id),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 users (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    email 
VARCHAR
(
255
) 
NOT
 
NULL
,
    phone 
VARCHAR
(
50
),
    password_hash TEXT,
    first_name 
VARCHAR
(
100
) 
NOT
 
NULL
,
    last_name 
VARCHAR
(
100
) 
NOT
 
NULL
,
    avatar_url TEXT,
    status 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'invited'
,
    branch_id UUID 
REFERENCES
 branches(id),
    department_id UUID 
REFERENCES
 departments(id),
    manager_id UUID 
REFERENCES
 users(id),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    version 
INTEGER
 
NOT
 
NULL
 
DEFAULT
 
1
,
    
UNIQUE
 (tenant_id, email)
);
CREATE
 
TABLE
 roles (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    code 
VARCHAR
(
80
) 
NOT
 
NULL
,
    name 
VARCHAR
(
120
) 
NOT
 
NULL
,
    is_system 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
FALSE
,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    
UNIQUE
 (tenant_id, code)
);
CREATE
 
TABLE
 permissions (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    code 
VARCHAR
(
150
) 
NOT
 
NULL
 
UNIQUE
,
    
module
 
VARCHAR
(
80
) 
NOT
 
NULL
,
    description TEXT
);
CREATE
 
TABLE
 user_roles (
    user_id UUID 
NOT
 
NULL
 
REFERENCES
 users(id) 
ON
 
DELETE
 
CASCADE
,
    role_id UUID 
NOT
 
NULL
 
REFERENCES
 roles(id) 
ON
 
DELETE
 
CASCADE
,
    
PRIMARY
 
KEY
 (user_id, role_id)
);
CREATE
 
TABLE
 role_permissions (
    role_id UUID 
NOT
 
NULL
 
REFERENCES
 roles(id) 
ON
 
DELETE
 
CASCADE
,
    permission_id UUID 
NOT
 
NULL
 
REFERENCES
 permissions(id) 
ON
 
DELETE
 
CASCADE
,
    
PRIMARY
 
KEY
 (role_id, permission_id)
);
CREATE
 
TABLE
 teams (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    name 
VARCHAR
(
150
) 
NOT
 
NULL
,
    leader_id UUID 
REFERENCES
 users(id),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 team_members (
    team_id UUID 
NOT
 
NULL
 
REFERENCES
 teams(id) 
ON
 
DELETE
 
CASCADE
,
    user_id UUID 
NOT
 
NULL
 
REFERENCES
 users(id) 
ON
 
DELETE
 
CASCADE
,
    
PRIMARY
 
KEY
 (team_id, user_id)
);
-- =========================================================
-- 2. CRM
-- =========================================================
CREATE
 
TABLE
 customer_segments (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    name 
VARCHAR
(
120
) 
NOT
 
NULL
,
    description TEXT,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 customers (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    customer_type 
VARCHAR
(
30
) 
NOT
 
NULL
,
    code 
VARCHAR
(
80
),
    company_name 
VARCHAR
(
255
),
    first_name 
VARCHAR
(
100
),
    last_name 
VARCHAR
(
100
),
    tax_number 
VARCHAR
(
50
),
    tax_office 
VARCHAR
(
100
),
    email 
VARCHAR
(
255
),
    phone 
VARCHAR
(
50
),
    source 
VARCHAR
(
100
),
    segment_id UUID 
REFERENCES
 customer_segments(id),
    status 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'new'
,
    assigned_user_id UUID 
REFERENCES
 users(id),
    branch_id UUID 
REFERENCES
 branches(id),
    credit_limit 
NUMERIC
(
18
,
2
),
    risk_score 
NUMERIC
(
5
,
2
),
    lifetime_value 
NUMERIC
(
18
,
2
),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    created_by UUID 
REFERENCES
 users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID 
REFERENCES
 users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID 
REFERENCES
 users(id),
    version 
INTEGER
 
NOT
 
NULL
 
DEFAULT
 
1
);
CREATE
 
TABLE
 customer_contacts (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    customer_id UUID 
NOT
 
NULL
 
REFERENCES
 customers(id) 
ON
 
DELETE
 
CASCADE
,
    full_name 
VARCHAR
(
255
) 
NOT
 
NULL
,
    title 
VARCHAR
(
120
),
    email 
VARCHAR
(
255
),
    phone 
VARCHAR
(
50
),
    mobile 
VARCHAR
(
50
),
    is_primary 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
FALSE
,
    is_decision_maker 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
FALSE
,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 customer_addresses (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    customer_id UUID 
NOT
 
NULL
 
REFERENCES
 customers(id) 
ON
 
DELETE
 
CASCADE
,
    address_type 
VARCHAR
(
30
) 
NOT
 
NULL
,
    country 
VARCHAR
(
100
),
    city 
VARCHAR
(
100
),
    district 
VARCHAR
(
100
),
    address_line TEXT 
NOT
 
NULL
,
    postal_code 
VARCHAR
(
20
),
    latitude 
NUMERIC
(
10
,
7
),
    longitude 
NUMERIC
(
10
,
7
),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
-- =========================================================
-- 3. LEAD
-- =========================================================
CREATE
 
TABLE
 lead_sources (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    name 
VARCHAR
(
120
) 
NOT
 
NULL
,
    channel 
VARCHAR
(
80
),
    is_active 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
TRUE
);
CREATE
 
TABLE
 leads (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    full_name 
VARCHAR
(
255
),
    company_name 
VARCHAR
(
255
),
    email 
VARCHAR
(
255
),
    phone 
VARCHAR
(
50
),
    source_id UUID 
REFERENCES
 lead_sources(id),
    status 
VARCHAR
(
40
) 
NOT
 
NULL
 
DEFAULT
 
'new'
,
    score 
INTEGER
 
NOT
 
NULL
 
DEFAULT
 
0
,
    temperature 
VARCHAR
(
20
),
    assigned_user_id UUID 
REFERENCES
 users(id),
    customer_id UUID 
REFERENCES
 customers(id),
    opportunity_id UUID,
    converted_at TIMESTAMPTZ,
    lost_reason 
VARCHAR
(
255
),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    created_by UUID 
REFERENCES
 users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID 
REFERENCES
 users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID 
REFERENCES
 users(id),
    version 
INTEGER
 
NOT
 
NULL
 
DEFAULT
 
1
);
-- =========================================================
-- 4. SALES
-- =========================================================
CREATE
 
TABLE
 pipelines (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    name 
VARCHAR
(
150
) 
NOT
 
NULL
,
    
module
 
VARCHAR
(
50
) 
DEFAULT
 
'sales'
,
    is_default 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
FALSE
,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 pipeline_stages (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    pipeline_id UUID 
NOT
 
NULL
 
REFERENCES
 pipelines(id) 
ON
 
DELETE
 
CASCADE
,
    name 
VARCHAR
(
120
) 
NOT
 
NULL
,
    probability 
NUMERIC
(
5
,
2
) 
NOT
 
NULL
 
DEFAULT
 
0
,
    sort_order 
INTEGER
 
NOT
 
NULL
,
    stage_type 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'open'
);
CREATE
 
TABLE
 opportunities (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    customer_id UUID 
NOT
 
NULL
 
REFERENCES
 customers(id),
    lead_id UUID 
REFERENCES
 leads(id),
    pipeline_id UUID 
NOT
 
NULL
 
REFERENCES
 pipelines(id),
    stage_id UUID 
NOT
 
NULL
 
REFERENCES
 pipeline_stages(id),
    title 
VARCHAR
(
255
) 
NOT
 
NULL
,
    amount 
NUMERIC
(
18
,
2
) 
NOT
 
NULL
 
DEFAULT
 
0
,
    currency 
VARCHAR
(
3
) 
NOT
 
NULL
 
DEFAULT
 
'TRY'
,
    probability 
NUMERIC
(
5
,
2
),
    expected_close_date 
DATE
,
    status 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'open'
,
    assigned_user_id UUID 
REFERENCES
 users(id),
    lost_reason 
VARCHAR
(
255
),
    won_at TIMESTAMPTZ,
    lost_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    created_by UUID 
REFERENCES
 users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID 
REFERENCES
 users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID 
REFERENCES
 users(id),
    version 
INTEGER
 
NOT
 
NULL
 
DEFAULT
 
1
);
ALTER
 
TABLE
 leads
ADD
 
CONSTRAINT
 fk_leads_opportunity
FOREIGN
 
KEY
 (opportunity_id) 
REFERENCES
 opportunities(id);
CREATE
 
TABLE
 opportunity_products (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    opportunity_id UUID 
NOT
 
NULL
 
REFERENCES
 opportunities(id) 
ON
 
DELETE
 
CASCADE
,
    product_id UUID,
    product_variant_id UUID,
    quantity 
NUMERIC
(
18
,
3
) 
NOT
 
NULL
 
DEFAULT
 
1
,
    estimated_unit_price 
NUMERIC
(
18
,
2
),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
-- =========================================================
-- 5. PRODUCT / BASIC CATALOG
-- =========================================================
CREATE
 
TABLE
 product_categories (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    name 
VARCHAR
(
150
) 
NOT
 
NULL
,
    parent_id UUID 
REFERENCES
 product_categories(id)
);
CREATE
 
TABLE
 product_brands (
    id UUID 
PRIMARY
 
KEY
 
DEFAULT
 gen_random_uuid(),
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
