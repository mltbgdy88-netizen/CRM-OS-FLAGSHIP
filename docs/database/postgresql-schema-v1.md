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
    name 
VARCHAR
(
150
) 
NOT
 
NULL
);
CREATE
 
TABLE
 products (
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
    sku 
VARCHAR
(
100
) 
NOT
 
NULL
,
    name 
VARCHAR
(
255
) 
NOT
 
NULL
,
    description TEXT,
    category_id UUID 
REFERENCES
 product_categories(id),
    brand_id UUID 
REFERENCES
 product_brands(id),
    product_type 
VARCHAR
(
50
) 
NOT
 
NULL
 
DEFAULT
 
'product'
,
    unit 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'pcs'
,
    is_stock_tracked 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
TRUE
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
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    
UNIQUE
 (tenant_id, sku)
);
CREATE
 
TABLE
 product_variants (
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
    product_id UUID 
NOT
 
NULL
 
REFERENCES
 products(id) 
ON
 
DELETE
 
CASCADE
,
    sku 
VARCHAR
(
100
) 
NOT
 
NULL
,
    barcode 
VARCHAR
(
100
),
    color 
VARCHAR
(
100
),
    pattern 
VARCHAR
(
100
),
    
size
 
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
    
UNIQUE
 (tenant_id, sku)
);
-- =========================================================
-- 6. QUOTE
-- =========================================================
CREATE
 
TABLE
 quotes (
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
    quote_no 
VARCHAR
(
80
) 
NOT
 
NULL
,
    customer_id UUID 
NOT
 
NULL
 
REFERENCES
 customers(id),
    opportunity_id UUID 
REFERENCES
 opportunities(id),
    status 
VARCHAR
(
40
) 
NOT
 
NULL
 
DEFAULT
 
'draft'
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
    subtotal_amount 
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
    discount_amount 
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
    tax_amount 
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
    total_amount 
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
    cost_amount 
NUMERIC
(
18
,
2
),
    profit_amount 
NUMERIC
(
18
,
2
),
    margin_percent 
NUMERIC
(
6
,
2
),
    valid_until 
DATE
,
    sent_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
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
,
    
UNIQUE
 (tenant_id, quote_no)
);
CREATE
 
TABLE
 quote_items (
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
    quote_id UUID 
NOT
 
NULL
 
REFERENCES
 quotes(id) 
ON
 
DELETE
 
CASCADE
,
    product_id UUID 
REFERENCES
 products(id),
    product_variant_id UUID 
REFERENCES
 product_variants(id),
    description TEXT,
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
    unit 
VARCHAR
(
30
),
    unit_price 
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
    discount_amount 
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
    tax_rate 
NUMERIC
(
5
,
2
) 
NOT
 
NULL
 
DEFAULT
 
20
,
    line_total 
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
);
CREATE
 
TABLE
 quote_approvals (
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
    quote_id UUID 
NOT
 
NULL
 
REFERENCES
 quotes(id) 
ON
 
DELETE
 
CASCADE
,
    requested_by UUID 
NOT
 
NULL
 
REFERENCES
 users(id),
    status 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'pending'
,
    reason TEXT,
    requested_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    decided_by UUID 
REFERENCES
 users(id),
    decided_at TIMESTAMPTZ
);
-- =========================================================
-- 7. TASK / ACTIVITY
-- =========================================================
CREATE
 
TABLE
 tasks (
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
    title 
VARCHAR
(
255
) 
NOT
 
NULL
,
    description TEXT,
    entity_type 
VARCHAR
(
50
),
    entity_id UUID,
    assigned_user_id UUID 
REFERENCES
 users(id),
    priority 
VARCHAR
(
20
) 
NOT
 
NULL
 
DEFAULT
 
'normal'
,
    status 
VARCHAR
(
30
) 
NOT
 
NULL
 
DEFAULT
 
'action_item'
,
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
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
 activities (
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
    entity_type 
VARCHAR
(
50
) 
NOT
 
NULL
,
    entity_id UUID 
NOT
 
NULL
,
    activity_type 
VARCHAR
(
50
) 
NOT
 
NULL
,
    subject 
VARCHAR
(
255
),
    content TEXT,
    activity_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    created_by UUID 
REFERENCES
 users(id)
);
-- =========================================================
-- 8. COMMON
-- =========================================================
CREATE
 
TABLE
 files (
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
    entity_type 
VARCHAR
(
50
),
    entity_id UUID,
    file_name 
VARCHAR
(
255
) 
NOT
 
NULL
,
    mime_type 
VARCHAR
(
120
),
    size_bytes BIGINT,
    storage_provider 
VARCHAR
(
50
) 
NOT
 
NULL
 
DEFAULT
 
'minio'
,
    storage_path TEXT 
NOT
 
NULL
,
    uploaded_by UUID 
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
 comments (
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
    entity_type 
VARCHAR
(
50
) 
NOT
 
NULL
,
    entity_id UUID 
NOT
 
NULL
,
    body TEXT 
NOT
 
NULL
,
    created_by UUID 
NOT
 
NULL
 
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
 tags (
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
80
) 
NOT
 
NULL
,
    color 
VARCHAR
(
20
),
    
module
 
VARCHAR
(
80
),
    
UNIQUE
 (tenant_id, name)
);
CREATE
 
TABLE
 entity_tags (
    tenant_id UUID 
NOT
 
NULL
 
REFERENCES
 tenants(id),
    tag_id UUID 
NOT
 
NULL
 
REFERENCES
 tags(id) 
ON
 
DELETE
 
CASCADE
,
    entity_type 
VARCHAR
(
50
) 
NOT
 
NULL
,
    entity_id UUID 
NOT
 
NULL
,
    
PRIMARY
 
KEY
 (tenant_id, tag_id, entity_type, entity_id)
);
CREATE
 
TABLE
 timeline_events (
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
    entity_type 
VARCHAR
(
50
) 
NOT
 
NULL
,
    entity_id UUID 
NOT
 
NULL
,
    event_type 
VARCHAR
(
100
) 
NOT
 
NULL
,
    title 
VARCHAR
(
255
) 
NOT
 
NULL
,
    payload JSONB,
    occurred_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW(),
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 domain_events (
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
    event_type 
VARCHAR
(
100
) 
NOT
 
NULL
,
    aggregate_type 
VARCHAR
(
80
) 
NOT
 
NULL
,
    aggregate_id UUID 
NOT
 
NULL
,
    payload JSONB 
NOT
 
NULL
,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
CREATE
 
TABLE
 audit_logs (
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
    user_id UUID 
REFERENCES
 users(id),
    entity_type 
VARCHAR
(
80
) 
NOT
 
NULL
,
    entity_id UUID,
    
action
 
VARCHAR
(
50
) 
NOT
 
NULL
,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
-- =========================================================
-- 9. NOTIFICATION
-- =========================================================
CREATE
 
TABLE
 notifications (
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
    user_id UUID 
NOT
 
NULL
 
REFERENCES
 users(id),
    type 
VARCHAR
(
50
) 
NOT
 
NULL
,
    title 
VARCHAR
(
255
) 
NOT
 
NULL
,
    body TEXT,
    entity_type 
VARCHAR
(
50
),
    entity_id UUID,
    is_read 
BOOLEAN
 
NOT
 
NULL
 
DEFAULT
 
FALSE
,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ 
NOT
 
NULL
 
DEFAULT
 NOW()
);
-- =========================================================
-- 10. INDEXES
-- =========================================================
CREATE
 INDEX idx_users_tenant 
ON
 users(tenant_id);
CREATE
 INDEX idx_users_tenant_status 
ON
 users(tenant_id, status);
CREATE
 INDEX idx_customers_tenant 
ON
 customers(tenant_id);
CREATE
 INDEX idx_customers_tenant_status 
ON
 customers(tenant_id, status);
CREATE
 INDEX idx_customers_assigned_user 
ON
 customers(tenant_id, assigned_user_id);
CREATE
 INDEX idx_customers_deleted 
ON
 customers(tenant_id, deleted_at);
CREATE
 INDEX idx_customer_contacts_customer 
ON
 customer_contacts(tenant_id, customer_id);
CREATE
 INDEX idx_customer_addresses_customer 
ON
 customer_addresses(tenant_id, customer_id);
CREATE
 INDEX idx_leads_tenant 
ON
 leads(tenant_id);
CREATE
 INDEX idx_leads_status 
ON
 leads(tenant_id, status);
CREATE
 INDEX idx_leads_assigned_user 
ON
 leads(tenant_id, assigned_user_id);
CREATE
 INDEX idx_opportunities_tenant 
ON
 opportunities(tenant_id);
CREATE
 INDEX idx_opportunities_stage 
ON
 opportunities(tenant_id, stage_id);
CREATE
 INDEX idx_opportunities_customer 
ON
 opportunities(tenant_id, customer_id);
CREATE
 INDEX idx_opportunities_assigned_user 
ON
 opportunities(tenant_id, assigned_user_id);
CREATE
 INDEX idx_quotes_tenant 
ON
 quotes(tenant_id);
CREATE
 INDEX idx_quotes_customer 
ON
 quotes(tenant_id, customer_id);
CREATE
 INDEX idx_quotes_status 
ON
 quotes(tenant_id, status);
CREATE
 INDEX idx_tasks_tenant 
ON
 tasks(tenant_id);
CREATE
 INDEX idx_tasks_assigned_user 
ON
 tasks(tenant_id, assigned_user_id);
CREATE
 INDEX idx_tasks_entity 
ON
 tasks(tenant_id, entity_type, entity_id);
CREATE
 INDEX idx_activities_entity 
ON
 activities(tenant_id, entity_type, entity_id);
CREATE
 INDEX idx_files_entity 
ON
 files(tenant_id, entity_type, entity_id);
CREATE
 INDEX idx_comments_entity 
ON
 comments(tenant_id, entity_type, entity_id);
CREATE
 INDEX idx_timeline_entity 
ON
 timeline_events(tenant_id, entity_type, entity_id);
CREATE
 INDEX idx_domain_events_unpublished 
ON
 domain_events(tenant_id, published_at) 
WHERE
 published_at 
IS
 
NULL
;
CREATE
 INDEX idx_audit_logs_entity 
ON
 audit_logs(tenant_id, entity_type, entity_id);
CREATE
 INDEX idx_notifications_user 
ON
 notifications(tenant_id, user_id, is_read);
-- =========================================================
-- 11. RLS
-- =========================================================
ALTER
 
TABLE
 users ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 customers ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 customer_contacts ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 customer_addresses ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 leads ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 pipelines ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 pipeline_stages ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 opportunities ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 quotes ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 quote_items ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 tasks ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 activities ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 files ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 comments ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 tags ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 timeline_events ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 domain_events ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 audit_logs ENABLE 
ROW
 
LEVEL
 SECURITY;
ALTER
 
TABLE
 notifications ENABLE 
ROW
 
LEVEL
 SECURITY;
CREATE
 POLICY tenant_isolation_users
ON
 users 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_customers
ON
 customers 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_customer_contacts
ON
 customer_contacts 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_customer_addresses
ON
 customer_addresses 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_leads
ON
 leads 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_pipelines
ON
 pipelines 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_pipeline_stages
ON
 pipeline_stages 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_opportunities
ON
 opportunities 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_quotes
ON
 quotes 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_quote_items
ON
 quote_items 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_tasks
ON
 tasks 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_activities
ON
 activities 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_files
ON
 files 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_comments
ON
 comments 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_tags
ON
 tags 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_timeline_events
ON
 timeline_events 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_domain_events
ON
 domain_events 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_audit_logs
ON
 audit_logs 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);
CREATE
 POLICY tenant_isolation_notifications
ON
 notifications 
USING
 (tenant_id 
=
 current_setting(
'app.tenant_id'
)::uuid);


Bu 
v1 şema
, ilk ürün çekirdeğini ayağa kaldırır:


Tenant
User
Role
Permission
Customer
Lead
Opportunity
Quote
Task
Activity
Files
Timeline
Audit
Notification


Sonraki teknik çıktı: 
CRM OS OpenAPI Contract v1
.
