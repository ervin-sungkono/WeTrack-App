"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import Button from "@/app/components/common/button/Button";
import PopUp from "@/app/components/common/alert/PopUp";
import PopUpForm from "@/app/components/common/alert/PopUpForm";
import PopUpLoad from "@/app/components/common/alert/PopUpLoad";
import UpdateTaskNameForm from "@/app/components/common/form/UpdateTaskNameForm";
import TaskDetail from "@/app/components/projects/task/TaskDetail";
import { deleteTask, updateTask } from "@/app/lib/fetch/task";
import type { TaskView } from "@/app/types/domain";

interface TaskNameFormValues {
  taskName: string;
}

interface TaskActions {
  viewTask(taskId: string): void;
  focusUpdateTask(task: TaskView): void;
  focusDeleteTask(task: TaskView): void;
}

interface TaskStoreState {
  selectedTaskId: string | null;
  isOpen: boolean;
  focusTask: TaskView | null;
  loading: boolean;
  updateConfirmation: boolean;
  deleteConfirmation: boolean;
  actions: TaskActions;
  closeTask(): void;
  closeUpdateConfirmation(): void;
  closeDeleteConfirmation(): void;
  handleUpdateTaskName(values: TaskNameFormValues): Promise<void>;
  handleDeleteTask(): Promise<void>;
}

type TaskStoreApi = StoreApi<TaskStoreState>;
const TaskStoreContext = createContext<TaskStoreApi | null>(null);

function createTaskStore(): TaskStoreApi {
  return createStore<TaskStoreState>()((set, get) => {
    const actions: TaskActions = {
      viewTask: (taskId) => set({ selectedTaskId: taskId, isOpen: true }),
      focusUpdateTask: (task) => set({ focusTask: task, updateConfirmation: true }),
      focusDeleteTask: (task) => set({ focusTask: task, deleteConfirmation: true }),
    };

    return {
      selectedTaskId: null,
      isOpen: false,
      focusTask: null,
      loading: false,
      updateConfirmation: false,
      deleteConfirmation: false,
      actions,
      closeTask: () => set({ isOpen: false }),
      closeUpdateConfirmation: () => set({ updateConfirmation: false }),
      closeDeleteConfirmation: () => set({ deleteConfirmation: false }),
      handleUpdateTaskName: async ({ taskName }) => {
        const focusTask = get().focusTask;
        if (!focusTask) return;
        set({ loading: true });
        try {
          if (taskName !== focusTask.taskName) {
            await updateTask({ taskId: focusTask.id, taskName: taskName.trim() });
          }
        } catch (error) {
          console.error("Failed to update task name", error);
        } finally {
          set({ updateConfirmation: false, loading: false });
        }
      },
      handleDeleteTask: async () => {
        const focusTask = get().focusTask;
        if (!focusTask) return;
        set({ loading: true });
        try {
          await deleteTask({ taskId: focusTask.id });
        } catch (error) {
          console.error("Failed to delete task", error);
        } finally {
          set({ deleteConfirmation: false, loading: false });
        }
      },
    };
  });
}

function useTaskStoreApi(): TaskStoreApi {
  const store = useContext(TaskStoreContext);
  if (!store) throw new Error("Task hooks must be used inside TaskProvider");
  return store;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createTaskStore);
  const state = useStore(store);

  return (
    <TaskStoreContext.Provider value={store}>
      <PopUp open={state.isOpen}>
        <TaskDetail taskId={state.selectedTaskId} closeFn={state.closeTask} />
      </PopUp>
      {state.loading && <PopUpLoad />}
      {state.focusTask && state.updateConfirmation && (
        <UpdateTaskNameForm
          taskName={state.focusTask.taskName}
          onSubmit={state.handleUpdateTaskName}
          onClose={state.closeUpdateConfirmation}
        />
      )}
      {state.focusTask && state.deleteConfirmation && (
        <PopUpForm title="Hapus Tugas" message="Apakah Anda yakin ingin menghapus tugas ini?" wrapContent>
          <div className="mt-4 flex flex-col justify-end gap-2 xs:flex-row md:gap-4">
            <Button variant="danger" onClick={state.handleDeleteTask}>Hapus</Button>
            <Button variant="secondary" onClick={state.closeDeleteConfirmation}>Batal</Button>
          </div>
        </PopUpForm>
      )}
      {children}
    </TaskStoreContext.Provider>
  );
}

/** Compatibility hook: consumers receive stable actions and do not rerender with modal state. */
export function useTaskData(): TaskActions {
  return useStore(useTaskStoreApi(), (state) => state.actions);
}
