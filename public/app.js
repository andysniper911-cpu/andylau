const form = document.getElementById("new-task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

async function api(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function render(tasks) {
  list.innerHTML = "";
  emptyState.classList.toggle("empty-state--hidden", tasks.length > 0);

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = `task${task.done ? " task--done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task__checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", async () => {
      await api(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: checkbox.checked }),
      });
      await load();
    });

    const title = document.createElement("span");
    title.className = "task__title";
    title.textContent = task.title;

    const del = document.createElement("button");
    del.className = "task__delete";
    del.setAttribute("aria-label", "Delete task");
    del.textContent = "\u00d7";
    del.addEventListener("click", async () => {
      await api(`/api/tasks/${task.id}`, { method: "DELETE" });
      await load();
    });

    li.append(checkbox, title, del);
    list.append(li);
  }
}

async function load() {
  const tasks = await api("/api/tasks");
  render(tasks);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await api("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  input.value = "";
  await load();
});

load().catch((error) => {
  console.error(error);
});
