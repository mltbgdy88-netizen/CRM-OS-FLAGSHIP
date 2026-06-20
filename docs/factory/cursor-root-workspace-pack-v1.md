Evet, en doğru hamle bu olur.


Tüm kararları Cursor için repo köküne şu şekilde koyarız:


crm-os/
├── AGENTS.md
├── README.md
├── .cursor/
│   ├── rules/
│   ├── prompts/
│   └── playbooks/
├── .ai/
│   ├── agents/
│   ├── orchestration/
│   ├── checklists/
│   └── reviews/
├── specs/
│   ├── sprints/
│   ├── modules/
│   ├── api/
│   ├── db/
│   └── tests/
├── tools/
│   ├── generators/
│   └── validators/
├── apps/
├── packages/
├── infra/
└── docs/


Bunun faydası şu:


Cursor repo’yu açınca:
- Kuralları okur
- Sprint planını bilir
- Modül spec’lerini görür
- Agent rollerini anlar
- Generator hedeflerini bilir
- CI kalite kapılarını bilir
- Kod üretirken kafasına göre davranmaz


Yani dokümanlar ayrı bir yerde kalmaz; doğrudan 
repo işletim sistemi
 olur.


En doğru sıradaki çıktı:


CRM OS Cursor Root Workspace Pack v1


Bu pakette kök klasöre konacak dosyaları tek tek üretiriz:


AGENTS.md
.cursor/rules/*.md
.ai/orchestration/task-queue.yaml
specs/modules/_template/*
specs/sprints/sprint-01.yaml ... sprint-40.yaml
tools/generators/README.md
tools/validators/README.md
docs/architecture/blueprint.md


Böylece Cursor’a verilecek ilk komut şu olur:


Read AGENTS.md, .cursor/rules, specs/sprints, specs/modules.
Start with Sprint-1 Repository Bootstrap.
Generate only the requested files.
Run validation.
