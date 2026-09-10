"use client";

import React, { useEffect, useState } from "react";
import { Shell } from "../../components/Shell";
import { AIChat } from "../../components/AIChat";
import { TodoTask, UserPreferences, AIConfig, StudyNote } from "../../types";
import {
  loadTasks,
  loadNotes,
  loadPreferences,
  loadAIConfig,
} from "../../lib/taskStore";

export default function ChatPage() {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [initialTaskId, setInitialTaskId] = useState<string | undefined>(undefined);
  const [initialNoteId, setInitialNoteId] = useState<string | undefined>(undefined);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTasks(loadTasks());
    setNotes(loadNotes());
    setPrefs(loadPreferences());
    setConfig(loadAIConfig());

    const params = new URLSearchParams(window.location.search);
    const taskParam = params.get("taskId") || params.get("task");
    const noteParam = params.get("noteId") || params.get("note");
    const promptParam = params.get("prompt");

    if (taskParam) setInitialTaskId(taskParam);
    if (noteParam) setInitialNoteId(noteParam);
    if (promptParam) setInitialPrompt(promptParam);
  }, []);

  return (
    <Shell fullBleed>
      <AIChat
        tasks={tasks}
        notes={notes}
        initialTaskId={initialTaskId}
        initialNoteId={initialNoteId}
        initialPrompt={initialPrompt}
        userPreferences={prefs}
        aiConfig={config}
      />
    </Shell>
  );
}