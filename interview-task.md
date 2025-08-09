# Angular Developer Interview Task
## Event Management Module

---

## Goal

We're building an event organizing app with an Angular frontend and NestJS backend. As part of the hiring process, we want to assess how well you:

- Use Angular and structure your code modularly
- Write clean, maintainable code
- Work with Ant Design for the UI elements  
  https://ng.ant.design/components/overview/en
- Think about UX/UI design
- Leverage AI tools (ChatGPT, Claude, Codex, GitHub Copilot) to improve speed and quality
- Can communicate with future AI systems via a well-written `AGENT.md` file

We’re not looking for perfection — just thoughtful structure, clean UI, clear communication, and a touch of creativity.

---

## Project Context

- Backend is a mock data: https://hessadnani.com/api/mock.json
- Angular project is pre-configured
- Login is already implemented
- You must use Ant Design (NG-ZORRO) UI Components

---

## Your Task: Build the `EventManagementModule`

Create a modular Angular feature module that allows logged-in users to create, view, edit, and delete their events using mock data.

---

## Requirements

### A. My Events List Page

- Display all events created by the logged-in user’s organization
- Use Ant Design Table or Card components

Include:
- Search by title
- Filter (public/private)
- Sort by date
- Loading indicator and empty state
- Edit/Delete action buttons

---

### B. Create & Edit Event Page

Use Ant Design Forms, Inputs, DatePicker, Upload, Switch, etc.

Form Fields:
- Title (required)
- Description
- Date & Time with timezone
- Location (venue)
- Primary Image Upload
- Cover Image Upload
- Public/Private toggle

Guidelines:
- Use a shared form component for both create and edit modes
- Implement full form validation

---

### C. Event Details Page

- Use Ant Design components like Descriptions, Image, Tags
- Clean and responsive layout
- Include a "Copy Public Link" button for public events
- Optional: Allow sharing the event with a nice UI

---

## Technical Guidelines

- Create a dedicated Angular feature module: `event-management`
- Use NG-ZORRO for all UI components
- Structure the app using modular architecture
- Fetch and manage data from https://hessadnani.com/api/mock.json
- Use only the packages that are in `package.json` without adding a new one.
- No backend communication is required
- Use RxJS and Angular design patterns where appropriate

---

## AGENT.md Requirement (MANDATORY)

Create a file called `AGENT.md` in the root of your repo.

This file should serve as documentation for an AI agent that will read, maintain, or extend your code.

### Include:

1. Module Purpose  
   What this module does and its key files/folders

2. Architecture Overview  
   Components, services, state handling, and how data flows

3. How to Extend  
   Provide instructions for an AI/dev to:
  - Add a new field to the form
  - Add a new filter to the list
  - Enhance the detail view

4. AI Agent Notes
  - How AI was used (if at all)
  - Naming conventions to follow
  - Parts of the code the AI should avoid changing

5. Known Limitations / TODOs  
   Any incomplete parts or things that could be improved

6. Prompt Example (optional)  
   Example prompt to give to an AI to extend your module

---

## Bonus (Optional, but Valued)

| Area        | Ideas                                                                 |
|-------------|------------------------------------------------------------------------|
| UX Polish   | Confirm modals, autosave, tooltips                                     |
| Testing     | Unit tests for one component or service                                |
| Dark Mode   | Add a dark mode toggle using NG-ZORRO theming                          |
| Stats       | Show analytics like public/private event counts                        |
| AI Usage    | Leave comments with AI-generated snippets or prompts you used          |

---

## Time & Submission

- Deadline: Monday 17:00
- Submit: a zip file of your Angular project code (include `AGENT.md` in the root)
