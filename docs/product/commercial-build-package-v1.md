CRM OS Commercial Build Package v1


1. Commercial Package Amacı


Bu paket, MVP sonrası CRM OS’i 
satılabilir ticari SaaS ürüne
 dönüştürür.


MVP’de çalışan zincir:


Login
→ Customer
→ Lead
→ Opportunity
→ Quote
→ Task
→ Dashboard


Commercial sürümde şu zincire genişler:


Quote Approved
→ Order Created
→ Stock Reserved
→ Shipment
→ Invoice Reference slot
→ Payment Received
→ Account Balance Updated




2. Commercial Kapsam


Dahil Modüller


ORDER
PRODUCT
INVENTORY
FINANCE LITE
PAYMENT
RECEIVABLE
NOTIFICATION EXTENDED
WORKFLOW v1
CUSTOMER PORTAL v1
EMAIL
WHATSAPP SHELL
REPORTING EXTENDED


Dahil Değil


Full Accounting
Advanced Omnichannel
Ticket/SLA
Dealer Portal
AI Copilot
Marketplace
Low-Code
Mobile Offline




3. Commercial Ana Akış


1. Onaylanan teklif siparişe çevrilir.
2. Sipariş kalemleri oluşur.
3. Stok rezervasyonu yapılır.
4. Sipariş durumu takip edilir.
5. Sevkiyat kaydı oluşturulur.
6. Cari hesap oluşur/güncellenir.
7. Tahsilat girilir.
8. Cari bakiye güncellenir.
9. Müşteri portalında teklif/sipariş görünür.
10. Basit workflow tetiklenir.




4. Commercial Database Scope


Yeni Migration Set


011_order
012_product_inventory_extended
013_finance_lite
014_payment_receivable
015_customer_portal
016_workflow_v1
017_email_whatsapp_shell
018_reporting_extended


Yeni Tablolar


orders
order_items
order_status_history
order_reservations
order_shipments
order_shipment_items
order_deliveries
order_files
order_notes
warehouses
warehouse_locations
stocks
stock_movements
stock_reservations
stock_alerts
price_lists
product_prices
product_images
product_files
accounts
account_transactions
account_balances
credit_limits
payments
payment_methods
payment_allocations
installments
invoices
invoice_items
portal_users
portal_sessions
portal_access_logs
workflows
workflow_triggers
workflow_actions
workflow_runs
workflow_logs
email_templates
email_logs
whatsapp_templates
whatsapp_logs
dashboard_widgets
metric_snapshots




5. Commercial API Scope


Order


http
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/{id}
PATCH  /api/v1/orders/{id}
POST   /api/v1/quotes/{id}/convert-to-order
POST   /api/v1/orders/{id}/confirm
POST   /api/v1/orders/{id}/cancel
POST   /api/v1/orders/{id}/reserve-stock
POST   /api/v1/orders/{id}/ship
POST   /api/v1/orders/{id}/deliver


Product


http
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PATCH  /api/v1/products/{id}
GET    /api/v1/product-variants
POST   /api/v1/products/{id}/variants
PATCH  /api/v1/product-variants/{id}
GET    /api/v1/price-lists
POST   /api/v1/price-lists
POST   /api/v1/product-prices


Inventory


http
GET    /api/v1/warehouses
POST   /api/v1/warehouses
GET    /api/v1/stocks
GET    /api/v1/stocks/{id}
GET    /api/v1/stocks/availability
POST   /api/v1/stock-movements
POST   /api/v1/stock-reservations
POST   /api/v1/stock-reservations/{id}/release
POST   /api/v1/stock-adjustments


Finance Lite


http
GET    /api/v1/accounts
GET    /api/v1/accounts/{id}
GET    /api/v1/accounts/{id}/transactions
GET    /api/v1/customers/{id}/account
GET    /api/v1/customers/{id}/balance
POST   /api/v1/payments
GET    /api/v1/payments
GET    /api/v1/payments/{id}
POST   /api/v1/payments/{id}/cancel
GET    /api/v1/receivables
GET    /api/v1/receivables/overdue


Customer Portal


http
POST   /api/v1/portal/auth/login
POST   /api/v1/portal/auth/logout
GET    /api/v1/portal/me
GET    /api/v1/portal/quotes
GET    /api/v1/portal/quotes/{id}
POST   /api/v1/portal/quotes/{id}/approve
POST   /api/v1/portal/quotes/{id}/reject
GET    /api/v1/portal/orders
GET    /api/v1/portal/orders/{id}
GET    /api/v1/portal/account
GET    /api/v1/portal/payments


Workflow v1


http
GET    /api/v1/workflows
POST   /api/v1/workflows
GET    /api/v1/workflows/{id}
PATCH  /api/v1/workflows/{id}
POST   /api/v1/workflows/{id}/activate
POST   /api/v1/workflows/{id}/pause
GET    /api/v1/workflow-runs
GET    /api/v1/workflow-runs/{id}




6. Commercial Frontend Scope


Yeni Ekranlar


/orders
/orders/[id]
/products
/products/new
/products/[id]
/inventory
/inventory/stocks
/inventory/movements
/inventory/warehouses
/finance
/finance/accounts
/finance/receivables
/finance/payments
/workflows
/workflows/new
/workflows/[id]
/portal/login
/portal/quotes
/portal/orders
/portal/account


Yeni Bileşenler


OrderStatusStepper
OrderItemsTable
ShipmentPanel
StockAvailabilityBadge
StockReservationPanel
ProductForm
VariantTable
PriceListSelector
StockLedgerTable
WarehouseSelector
AccountBalanceCard
AccountTransactionTable
PaymentForm
ReceivableAgingTable
WorkflowList
WorkflowRuleBuilder
WorkflowRunLog
PortalShell
PortalQuoteView
PortalOrderView
PortalAccountSummary




7. Backend Module Scope


order module


orders
order_items
order_status
quote_to_order
shipment
delivery


product module


products
variants
categories
brands
price_lists
prices


inventory module


warehouses
stocks
stock_movements
reservations
availability
alerts


finance module


accounts
transactions
payments
receivables
installments
invoice_reference slot


workflow module


workflow_rules
event_triggers
simple_actions
run_logs


portal module


portal_auth
portal_quotes
portal_orders
portal_account




8. Commercial Events


QuoteConvertedToOrder
OrderCreated
OrderConfirmed
OrderCancelled
OrderStatusChanged
OrderReservationRequested
OrderReserved
OrderReservationFailed
OrderShipped
OrderDelivered
ProductCreated
ProductVariantCreated
ProductPriceUpdated
StockCreated
StockChanged
StockMovementCreated
StockReserved
StockReservationReleased
StockCriticalLevelReached
AccountCreated
AccountTransactionCreated
AccountBalanceUpdated
PaymentCreated
PaymentReceived
PaymentCancelled
PaymentOverdue
InvoiceCreated
WorkflowCreated
WorkflowActivated
WorkflowTriggered
WorkflowRunStarted
WorkflowRunCompleted
WorkflowRunFailed
PortalUserLoggedIn
PortalQuoteApproved
PortalQuoteRejected




9. Commercial Permissions


Order


order.order.read
order.order.create
order.order.update
order.order.cancel
order.order.confirm
order.order.ship
order.order.deliver


Product / Inventory


inventory.product.read
inventory.product.create
inventory.product.update
inventory.product.delete
inventory.stock.read
inventory.stock.adjust
inventory.stock.transfer
inventory.stock.reserve
inventory.stock.release


Finance


finance.account.read
finance.balance.read
finance.transaction.read
finance.payment.read
finance.payment.create
finance.payment.cancel
finance.receivable.read
finance.report.read


Portal


portal.quote.read_own
portal.quote.approve_own
portal.quote.reject_own
portal.order.read_own
portal.account.read_own
portal.payment.read_own


Workflow


workflow.workflow.read
workflow.workflow.create
workflow.workflow.update
workflow.workflow.activate
workflow.workflow.pause
workflow.run.read




10. Commercial Default Role Updates


sales_manager


Eklenir:


order.order.read
order.order.create
order.order.update
order.order.confirm
inventory.product.read
inventory.stock.read
finance.balance.read
finance.receivable.read


sales_rep


Eklenir:


order.order.read
order.order.create
inventory.product.read
inventory.stock.read
finance.balance.read limited


finance_user


Eklenir:


finance.account.read
finance.balance.read
finance.transaction.read
finance.payment.read
finance.payment.create
finance.receivable.read
finance.report.read
order.order.read


warehouse_user


Eklenir:


order.order.read
order.order.ship
order.order.deliver
inventory.stock.read
inventory.stock.reserve
inventory.stock.release
inventory.stock.adjust limited




11. Commercial Sprint Plan


Sprint 13 — Order Core


ORDER-001 orders migration
ORDER-002 order_items migration
ORDER-003 order_status_history migration
ORDER-004 Order CRUD API
ORDER-005 Quote to Order API
ORDER-006 Order list UI
ORDER-007 Order detail UI
ORDER-008 Order status stepper


Sprint 14 — Order Operations


ORDER-009 Confirm order API
ORDER-010 Cancel order API
ORDER-011 Order notes/files
ORDER-012 Order shipment shell
ORDER-013 Order delivery shell
ORDER-014 Order audit/timeline events
ORDER-015 Order E2E tests


Sprint 15 — Product Catalog


PROD-001 product extended fields
PROD-002 product variants
PROD-003 categories/brands UI
PROD-004 product CRUD API
PROD-005 variant CRUD API
PROD-006 price list migration
PROD-007 product price API
PROD-008 Product list/detail UI


Sprint 16 — Inventory Core


INV-001 warehouses migration
INV-002 stocks migration
INV-003 stock_movements migration
INV-004 stock availability API
INV-005 stock movement API
INV-006 warehouse UI
INV-007 stock ledger UI
INV-008 critical stock alert


Sprint 17 — Stock Reservation


INV-009 stock_reservations migration
INV-010 reserve stock API
INV-011 release reservation API
INV-012 order stock reservation flow
INV-013 stock availability badge
INV-014 reservation panel UI
INV-015 reservation failure handling


Sprint 18 — Finance Lite Core


FIN-001 accounts migration
FIN-002 account_transactions migration
FIN-003 account balance service
FIN-004 customer account auto-create
FIN-005 account transaction API
FIN-006 account UI
FIN-007 customer balance panel


Sprint 19 — Payments / Receivables


FIN-008 payment_methods migration
FIN-009 payments migration
FIN-010 payment create API
FIN-011 payment cancel API
FIN-012 receivables API
FIN-013 overdue receivables API
FIN-014 payment form UI
FIN-015 receivable aging UI


Sprint 20 — Workflow v1 / Customer Portal


WF-001 workflow migration
WF-002 workflow trigger model
WF-003 workflow simple action model
WF-004 workflow run engine v1
WF-005 quote sent reminder workflow
WF-006 payment overdue workflow
PORTAL-001 portal auth
PORTAL-002 portal quote view
PORTAL-003 portal order view
PORTAL-004 portal account view




12. Order Business Rules


Quote to Order


Sadece approved quote siparişe çevrilebilir.
Aynı quote bir kez siparişe çevrilir.
Quote kalemleri order_items olarak kopyalanır.
Fiyatlar sipariş oluşturma anında dondurulur.


Order Status


draft
confirmed
preparing
reserved
partially_shipped
shipped
delivered
cancelled
returned


Status Transitions


draft → confirmed
confirmed → reserved
reserved → preparing
preparing → partially_shipped
partially_shipped → shipped
shipped → delivered
draft/confirmed → cancelled
delivered → returned




13. Inventory Business Rules


Stock Fields


quantity_on_hand
quantity_reserved
quantity_available


Kural:


quantity_available = quantity_on_hand - quantity_reserved


Reservation


Stok varsa reserve edilir.
Yeterli stok yoksa partial veya failed döner.
Rezervasyon order bazlı tutulur.
Order cancel olursa reservation release edilir.
Shipment olursa reservation stock out movement’a dönüşür.


Stock Movement Types


in
out
reserve
release
adjust
transfer_in
transfer_out
count




14. Finance Lite Business Rules


Account


Her customer için bir account oluşur.
Her payment account transaction üretir.
Her invoice/order receivable transaction üretir.
Balance transactionlardan hesaplanır veya snapshot tutulur.


Transaction Logic


Invoice/Order → debit
Payment → credit
Refund → debit/credit rule based


Receivable Aging


0-30 gün
31-60 gün
61-90 gün
90+ gün




15. Workflow v1 Scope


Workflow v1 basit olacak.


Trigger Types


event
time_delay
manual


MVP Triggers


QuoteSent
QuoteViewed
QuoteExpired
OrderCreated
PaymentOverdue
StockCriticalLevelReached
TaskOverdue


Actions


create_task
send_email
send_notification
send_whatsapp_reference slot
update_status


Conditions


status equals
amount greater than
days passed
assigned user exists




16. Customer Portal v1


Portal Kapsamı


Müşteri giriş yapar.
Kendi tekliflerini görür.
Teklifi onaylar/reddeder.
Sipariş durumunu görür.
Cari bakiyesini görür.
Ödeme geçmişini görür.
Destek talebi reference slot.


Güvenlik


customer_self scope
portal token
tenant isolation
no internal notes
no internal cost/margin




17. Reporting Extended


Yeni metrikler:


order_count
order_total_amount
reserved_stock_value
available_stock_value
payment_received_amount
overdue_receivables
customer_balance_total
top_products
stock_alert_count


Dashboard ekleri:


Order Dashboard
Inventory Dashboard
Finance Dashboard
Receivables Widget
Stock Alert Widget




18. Commercial Test Suite


Order Tests


quote to order
approved quote required
duplicate conversion blocked
status transition valid
cancel order
shipment flow


Inventory Tests


stock availability
reserve stock
release stock
partial reservation
stock movement created
tenant isolation


Finance Tests


account auto-create
payment creates transaction
balance updated
payment cancel reverses transaction
receivables aging


Portal Tests


portal login
customer sees own quotes only
customer cannot see another customer quote
quote approve from portal
order visible in portal




19. Commercial Non-Functional Requirements


Performance


Order list p95 < 400ms
Stock availability p95 < 300ms
Payment create p95 < 500ms
Portal quote view p95 < 500ms
Receivables report p95 < 1000ms


Reliability


Stock reservation transaction-safe
Payment transaction atomic
Order conversion idempotent
Workflow retry supported




20. Commercial Acceptance Criteria


Commercial sürüm kabul için:


1. Approved quote order’a çevrilir.
2. Order status lifecycle çalışır.
3. Ürün ve varyant oluşturulur.
4. Depo ve stok tanımlanır.
5. Sipariş stok rezervasyonu yapar.
6. Stok hareketleri ledger’da görünür.
7. Customer account oluşur.
8. Payment girilir.
9. Account balance güncellenir.
10. Receivables dashboard çalışır.
11. Customer portal teklif/sipariş gösterir.
12. Basit workflow çalışır.
13. Tenant isolation testleri geçer.
14. Finance calculation testleri geçer.




21. Commercial Deliverables


Order module
Product module
Inventory module
Finance Lite module
Workflow v1
Customer Portal v1
Email sending shell
WhatsApp shell
Extended dashboards
New migrations
New permissions
New API contracts
New E2E tests
Updated user guide
Updated admin guide
Release notes




22. Commercial Go-Live Checklist


Order flow tested
Stock reservation tested
Payment transaction tested
Account balance tested
Portal access tested
Workflow retry tested
Permissions seeded
RLS enabled on new tables
Audit active on financial actions
Backup tested
Monitoring dashboards updated
Regression passed
UAT approved




23. Commercial Final Definition


Commercial sürüm şu zinciri canlıda çalıştırır:


Quote
→ Order
→ Stock
→ Payment
→ Balance
→ Portal
→ Workflow


Sonraki paket:


CRM OS Enterprise Build Package v1
