CRM OS Design System v2


1. Design System Mission


CRM OS Design System'in amacı:


Enterprise Grade
AI Native
Dark First
High Density
Fast Navigation


deneyimini tüm modüllerde standart hale getirmektir.


Temel prensip:


Bir ekranı hangi agent üretirse üretsin,
aynı ürün hissi vermeli.




2. Design Principles


P1 — Information First


Dekorasyon değil
Bilgi öncelikli




P2 — Enterprise Density


Daha az scroll
Daha fazla görünür veri




P3 — AI Native


Her modül:


AI Summary
AI Recommendation
AI Actions


için yer ayırmalıdır.




P4 — Consistency


Aynı aksiyon:


Kaydet
Sil
Onayla
İptal Et


tüm sistemde aynı görünmelidir.




3. Color System


Neutral Palette


CSS
--bg-900
: 
#
0
B0F14
;
--bg-800
: 
#
111827;
--bg-700
: 
#
1
F2937
;
--bg-600
: 
#
374151;
--surface-900
: 
#
111827;
--surface-800
: 
#
1
A2233
;
--surface-700
: 
#
243042;




Text Palette


CSS
--text-primary
: 
#
F9FAFB
;
--text-secondary
: 
#
D1D5DB
;
--text-muted
: 
#
9
CA3AF
;




Primary


CSS
--primary-500
: 
#
3
B82F6
;
--primary-600
: 
#
2563
EB
;




Success


CSS
--success-500
: 
#
22
C55E
;




Warning


CSS
--warning-500
: 
#
F59E0B
;




Danger


CSS
--danger-500
: 
#
EF4444
;




AI Accent


CSS
--ai-500
: 
#
8
B5CF6
;
--ai-600
: 
#
7
C3AED
;




4. Spacing System


8pt Grid


4
8
12
16
24
32
40
48
64
80
96




5. Radius System


CSS
--radius-sm
: 8
px
;
--radius-md
: 12
px
;
--radius-lg
: 16
px
;
--radius-xl
: 24
px
;




6. Elevation System


Level-1


CSS
0 1
px
 2
px
 
rgba
(0,0,0,.15)




Level-2


CSS
0 4
px
 12
px
 
rgba
(0,0,0,.20)




Level-3


CSS
0 8
px
 24
px
 
rgba
(0,0,0,.30)




7. Typography Scale


Font


Inter


Fallback:


system-ui




Display


CSS
56
px
700




H1


CSS
40
px
700




H2


CSS
32
px
700




H3


CSS
24
px
600




H4


CSS
20
px
600




Body


CSS
14
px
400




Small


CSS
12
px
400




8. Layout Tokens


Sidebar


CSS
collapsed
: 72
px
;
expanded
: 280
px
;




Top Bar


CSS
height
: 64
px
;




Page Padding


CSS
24
px




Content Gap


CSS
24
px




9. App Shell Standard


┌──────────────────────────────┐
│ Top Command Bar              │
├──────────┬───────────────────┤
│ Sidebar  │ Main Content      │
└──────────┴───────────────────┘




10. Button Standards


Primary


Blue
Filled


Kullanım:


Create
Save
Submit




Secondary


Ghost




Danger


Red




AI Action


Purple




11. Form Standards


Label


Always visible


Reference slot label yerine kullanılmaz.




Required Field


*


ile gösterilir.




Validation


Inline
Real-time




12. Input Standards


Height:


CSS
40
px




Search Input


Height:


CSS
44
px




13. Data Table Standards


CRM OS'un en kritik componenti.




Table Row


CSS
48
px




Density Modes


Comfortable
Compact




Sticky Header


Required




Sticky First Column


Optional




Actions


Dropdown




14. Customer Table Example


Customer No
Name
Owner
Status
Revenue
Last Activity




15. Detail Page Pattern


Her entity için:


Header
↓
Summary Cards
↓
Tabs
↓
Timeline
↓
Related Records
↓
AI Insights




16. Card Standards


Padding:


CSS
16
px




Radius:


CSS
16
px




Border:


CSS
1
px
 
subtle




17. KPI Card Standard


Title
Metric
Delta
Mini Chart




Örnek:


Revenue
$1.2M
+12%




18. Chart Standards


Kullanılacak:


Line
Bar
Area
Donut




Yasak:


3D charts
Pie explosions
Gauge spam




19. Kanban Standards


Pipeline için.




Kart:


Company
Value
Owner
Probability
Next Activity




Drag-drop:


Optimistic Update




20. Timeline Standards


Her entity:


Activity
Note
Email
Approval
Status Change
AI Insight


timeline üretir.




21. Drawer Standards


Sağdan açılır.


Genişlik:


CSS
640
px




Kullanım:


Quick View
Quick Edit
Quick Create




22. Modal Standards


Boyutlar:


sm
md
lg
xl




Yasak:


Nested Modal




23. Notification Standards


Türler:


success
warning
error
info




Pozisyon:


top-right




24. Command Palette


Kısayol:


CMD + K
CTRL + K




Örnek:


Create Customer
Create Quote
Open Dashboard
Ask CRM




25. AI Component Standards


AI Summary Card


Summary
Confidence
Source Records




AI Recommendation Card


Recommendation
Expected Impact
Action Button




AI Chat Panel


Conversation
Sources
Suggested Questions




26. Permission-Aware UI


Butonlar:


Hide




Yasak:


Disable + expose permission details




27. Empty State Standards


İçerik:


Title
Description
CTA




Örnek:


No Opportunities
Create your first opportunity.




28. Loading Standards


Kullanılacak:


Skeletons




Yasak:


Full page spinner




29. Responsive Strategy


Desktop First


1440+


Ana hedef.




Tablet


1024+




Mobile


Companion Experience




30. Component Library


AppShell
Sidebar
TopBar
DataTable
EntityHeader
EntityTabs
Timeline
MetricCard
ChartCard
KanbanBoard
ActivityFeed
Drawer
Modal
CommandPalette
AiSummaryCard
AiRecommendationCard
AiChatPanel




31. Cursor UI Rule


Cursor her yeni ekran üretirken:


Use CRM OS Design System v2.
Use existing components first.
Do not create custom UI patterns.
Follow:
- AppShell
- DataTable
- Detail Page Pattern
- AI Components
- Permission-aware UI




32. Definition of Done


Color system hazır
Typography hazır
Spacing hazır
Layout hazır
Table standardı hazır
Form standardı hazır
Chart standardı hazır
AI component standardı hazır
Permission-aware UI hazır
Cursor UI kuralları hazır




Sonraki Paket


CRM OS Screen Catalog v1


Bu paket artık tek tek:






Dashboard






Customer 360






Lead






Opportunity






Pipeline






Quote Builder






Order Management






Inventory






Ticket






Analytics






Ask CRM






ekranlarının piksel seviyesinde blueprint'ini çıkaracaktır.
