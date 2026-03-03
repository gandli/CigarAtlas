# CigarAtlas PRD v1 (MVP)

**Product:** CigarAtlas  
**Version:** v1.0 MVP  
**Date:** 2026-03-03  
**Owner:** Product Team

---

## 1. Product Vision

Build the most trusted digital companion for cigar enthusiasts by combining structured learning, tasting records, and community interaction under a compliance-first framework.

---

## 2. Product Scope (MVP)

### In Scope (P0)

1. **Learning Camp**
   - Beginner path (L1-L4): basics, selection, tasting mechanics, storage basics
   - Task/checkpoint design to improve completion

2. **Cigar Journal**
   - Entry fields: brand/line, size, date, context, pairing, flavor tags, score, notes
   - Personal dashboard: count, preference trends, recent records

3. **Core Community**
   - Post/comment/like
   - Q&A threads for beginner support
   - Activity post model (publish + join intent)

### Out of Scope (MVP)

- Live streaming tasting rooms
- IoT real-time integration
- Marketplace/transaction features
- Automated authenticity verdict engine

---

## 3. Compliance Requirements

- No direct online tobacco sales.
- No checkout/cart/payment flows for tobacco products.
- Channel discovery allowed as informational service only.
- Risk notices and compliance statements visible in user-facing flows.

---

## 4. Target Users

1. Beginner enthusiasts (need onboarding and anti-pitfall guidance)
2. Intermediate users (need record and comparison tools)
3. Social users (need circles, events, and identity signal)

---

## 5. Core User Stories

### Learning Camp
- As a beginner, I can follow a step-by-step learning path so I can make my first purchase and tasting decision confidently.

### Cigar Journal
- As an enthusiast, I can record each session and review my flavor preference trend over time.

### Community
- As a user, I can ask questions, share notes, and find peers/events in my city.

---

## 6. Functional Requirements

### 6.1 Learning Camp
- Course sections with completion status
- Quiz/checkpoint support
- Recommended next lesson logic

### 6.2 Cigar Journal
- Create/edit/delete entries
- Flavor tag taxonomy
- Sorting/filtering by date, brand, score
- Dashboard summaries

### 6.3 Community
- Feed with post cards
- Thread detail with comments
- Q&A tag
- Activity post template (city/date/topic/capacity)

---

## 7. Data Model (MVP)

- `User`
- `JournalEntry`
- `FlavorTag`
- `Post`
- `Comment`
- `ActivityPost`
- `LessonProgress`

---

## 8. Metrics & Success Criteria

### Primary Metrics
1. D7 retention
2. First-week journal completion rate
3. First-week post/comment conversion
4. Activity sign-up conversion

### MVP Success Gate
- D7 retention reaches target baseline set after first 2-week beta cohort.
- At least one journal entry completed by a meaningful portion of activated users.

---

## 9. Delivery Plan (4 Weeks)

### Week 1
- IA, wireframes, data schema, event tracking map

### Week 2
- Learning Camp MVP + Journal CRUD

### Week 3
- Community feed, thread, Q&A, activity posts

### Week 4
- Reminder logic, telemetry validation, QA, bug fixing, beta package

---

## 10. Risks & Mitigations

1. **Over-scope risk**
   - Mitigation: strict P0 boundary and weekly scope lock

2. **Compliance risk**
   - Mitigation: legal review checklist and no tobacco transaction flow

3. **Cold-start content risk**
   - Mitigation: seed content plan (lessons + starter posts + expert Q&A)

4. **Community quality risk**
   - Mitigation: reporting/moderation basics from day one

