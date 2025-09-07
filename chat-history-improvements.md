# Project Plan: Investigate chat history implementation in Bibble - specifically auto-save functionality and filtering system messages to prevent bloated history files

## Notes

### Current Issues Identified
- saveChat in history.ts saves all messages including massive system prompt causing bloated files
- No auto-save on exit even when saveHistory config is enabled
- /exit and /quit commands don't save automatically
- No graceful handling of Ctrl+C interruption
- User has to manually /save then exit for clunky UX

### Configuration Context
- chat.saveHistory is true by default in config
- History files are saved to ~/.bibble/history/ directory
- History saving works manually with /save command
- System prompt contains huge tool documentation causing file bloat

## Tasks Overview
- [ ] Review chat history storage issues
  - [ ] Check current saveChat implementation in history.ts
  - [ ] Review chat UI exit handling
  - [ ] Identify signal handling for Ctrl+C
- [ ] Implement system message filtering
  - [ ] Update history.ts saveChat method
  - [ ] Test system message filtering
- [ ] Implement auto-save on exit functionality
  - [ ] Modify chat UI exit commands
  - [ ] Add combined exit+save commands
  - [ ] Implement SIGINT handler
- [ ] Test and validate improvements
  - [ ] Test manual save with filtering
  - [ ] Test auto-save on exit
  - [ ] Test new exit+save commands
  - [ ] Test Ctrl+C handling

## Detailed Tasks

### 1. Review chat history storage issues
**Description:** Examine the current chat history saving mechanism and identify the issue with system message inclusion bloating files, and lack of auto-save on exit functionality

**Subtasks:**
- [ ] Check current saveChat implementation in history.ts
  - Description: Review how messages are filtered (or not filtered) before saving to identify system message bloat
- [ ] Review chat UI exit handling
  - Description: Examine how the chat loop exits and whether auto-save is implemented
- [ ] Identify signal handling for Ctrl+C
  - Description: Check if there's graceful shutdown handling for SIGINT/SIGTERM signals

### 2. Implement system message filtering
**Description:** Modify the saveChat method to filter out system messages before saving to prevent huge history files

**Subtasks:**
- [ ] Update history.ts saveChat method
  - Description: Add filtering to exclude system role messages before saving chat history
- [ ] Test system message filtering
  - Description: Verify that saved history files no longer contain the massive system prompt

### 3. Implement auto-save on exit functionality
**Description:** Add automatic saving when exiting chat if saveHistory config is enabled

**Subtasks:**
- [ ] Modify chat UI exit commands
  - Description: Update /exit and /quit commands to check config and auto-save if enabled
- [ ] Add combined exit+save commands
  - Description: Create /exit-save and /quit-save commands for explicit save-and-exit behavior
- [ ] Implement SIGINT handler
  - Description: Add signal handling for Ctrl+C to offer save prompt or auto-save before exit

### 4. Test and validate improvements
**Description:** Test all new functionality to ensure proper behavior

**Subtasks:**
- [ ] Test manual save with filtering
  - Description: Use /save command and verify system messages are filtered out
- [ ] Test auto-save on exit
  - Description: Use /exit and verify auto-save behavior when config is enabled
- [ ] Test new exit+save commands
  - Description: Test /exit-save and /quit-save commands work properly
- [ ] Test Ctrl+C handling
  - Description: Test that Ctrl+C provides appropriate save behavior

## Progress Tracking

| Task | Status | Completion Date |
|------|--------|----------------|
| Review chat history storage issues | 🔄 In Progress |  |
| Implement system message filtering | 🔄 In Progress |  |
| Implement auto-save on exit functionality | 🔄 In Progress |  |
| Test and validate improvements | 🔄 In Progress |  |
