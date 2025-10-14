# Feature Modules Archive Plan
**Purpose**: Preserve ELD, IFTA, SEO, and Video features for potential future reintegration

## Archive Structure

```
archived_features/
├── eld/
│   ├── components/           # UI components
│   ├── services/             # Business logic
│   ├── database/             # Schema files
│   ├── pages/                # Dashboard pages
│   ├── docs/                 # Documentation
│   ├── INTEGRATION_GUIDE.md  # How to re-integrate
│   └── package.json          # Dependencies used
│
├── ifta/
│   ├── components/
│   ├── services/
│   ├── database/
│   ├── pages/
│   ├── docs/
│   ├── INTEGRATION_GUIDE.md
│   └── package.json
│
├── seo/
│   ├── components/
│   ├── services/
│   ├── database/
│   ├── pages/
│   ├── docs/
│   ├── INTEGRATION_GUIDE.md
│   └── package.json
│
├── video/
│   ├── components/
│   ├── services/
│   ├── database/
│   ├── pages/
│   ├── docs/
│   ├── INTEGRATION_GUIDE.md
│   └── package.json
│
└── README.md                 # Master archive guide
```

## Files to Archive

### ELD Module
**Components:**
- src/components/eld/* → archived_features/eld/components/

**Services:**
- src/services/eld/* → archived_features/eld/services/

**Database:**
- src/database/eld_schema.sql → archived_features/eld/database/
- src/database/eld_service_schema.sql → archived_features/eld/database/
- src/database/add_eld_tables.js → archived_features/eld/database/

**Pages:**
- src/pages/ELDDashboard.tsx → archived_features/eld/pages/

**Python Module:**
- PycharmProjects/rapid_eld/* → archived_features/eld/rapid_eld/

**Server Routes:**
- Extract ELD routes from server.js → archived_features/eld/server_routes.js

**Configuration:**
- Extract ELD module config → archived_features/eld/dashboard_module_config.ts

### IFTA Module
**Components:**
- src/components/ifta/* → archived_features/ifta/components/

**Services:**
- src/services/ifta/* → archived_features/ifta/services/

**Database:**
- src/database/ifta_schema.sql → archived_features/ifta/database/
- src/database/minimal_ifta_init.js → archived_features/ifta/database/

**Pages:**
- src/pages/IFTADashboard.tsx → archived_features/ifta/pages/

**Server Routes:**
- Extract IFTA routes from server.js → archived_features/ifta/server_routes.js

**Configuration:**
- Extract IFTA module config → archived_features/ifta/dashboard_module_config.ts

### SEO Module
**Services:**
- src/services/seo/* → archived_features/seo/services/
- src/services/ai/SEOAutomationAgent* → archived_features/seo/ai_agents/

**Database:**
- src/database/seo_automation_schema.sql → archived_features/seo/database/

**Pages:**
- src/pages/SEODashboard.tsx → archived_features/seo/pages/

**Server Routes:**
- Extract SEO routes from server.js → archived_features/seo/server_routes.js

### Video Module
**Components:**
- src/components/video/* → archived_features/video/components/

**Services:**
- src/services/video/* → archived_features/video/services/

**Pages:**
- src/pages/VideoProductionDashboard.tsx → archived_features/video/pages/

**Server Routes:**
- Extract video routes from server.js → archived_features/video/server_routes.js

## Reintegration Process

### Quick Reintegration (Copy-Paste Method)
1. Copy archived folder back to src/
2. Add route to App.tsx
3. Add module to dashboardModules.ts
4. Add API routes to server.js
5. Run database migration
6. Test thoroughly

### Gradual Reintegration (Feature Flag Method)
1. Copy files back but wrap in feature flags
2. Enable via environment variable
3. Test in development
4. Deploy when ready

## Environment Variable Feature Flags

```env
# .env file
ENABLE_ELD_MODULE=false
ENABLE_IFTA_MODULE=false
ENABLE_SEO_MODULE=false
ENABLE_VIDEO_MODULE=false
```

## Git Ignore Configuration

Add to .gitignore if you want to keep archived features local-only:
```
# Archived features (optional - remove to track in git)
# archived_features/
```

**Recommendation:** DO track in git so team has access to archived code.

## Documentation Requirements

Each archived module must include:

### INTEGRATION_GUIDE.md
- Dependencies required
- Database tables needed
- API routes to add
- Configuration changes
- Testing checklist
- Known issues/limitations

### package.json
- List of npm packages this module needs
- Versions used when archived
- Peer dependencies

### CHANGELOG.md
- When archived
- Why archived
- Last working version
- Any breaking changes since archival

## Benefits of This Approach

✅ **Complete preservation** - All code intact and organized
✅ **Clear documentation** - Integration guides for each module
✅ **Easy reactivation** - Copy folder back and follow guide
✅ **No clutter** - Main codebase stays clean
✅ **Version controlled** - Git tracks archived code too
✅ **Searchable** - Can grep/search archived code anytime
✅ **Modular** - Reintegrate one module at a time
✅ **Professional** - Industry standard archival practice

## Alternative: NPM Package Approach

For maximum modularity, could publish as private npm packages:
```
@rapid-crm/eld-module
@rapid-crm/ifta-module
@rapid-crm/seo-module
@rapid-crm/video-module
```

Then reinstall when needed:
```bash
npm install @rapid-crm/eld-module
```

## Maintenance Schedule

- **Monthly Review**: Check if archived features are still relevant
- **Quarterly Update**: Update integration guides with current architecture
- **Annual Cleanup**: Remove truly obsolete archived features

---

**Created**: October 14, 2025
**Last Updated**: October 14, 2025
**Status**: Planning Document

