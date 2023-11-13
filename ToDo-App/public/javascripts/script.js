const render = async () => {
  const taskApi = "http://localhost:3000/tasks";
  const todoList = document.querySelector(".todo-list");

  const cookieValue = document.cookie.split("=")[1];
  if (cookieValue) handleToastRender(cookieValue);

  try {
    const respond = await fetch(taskApi);
    if (respond.status === 200) {
      const data = await respond.json();
      const taskList = data
        .map(({ id, description, status }) => {
          const iconClasses = !status
            ? "fa-regular fa-circle fa-lg"
            : "fa-solid fa-circle-check fa-lg";
          const descClasses = !status ? "todo-input " : "todo-input checked";
          const styleClasses = status ? "color: #ff643b" : "";

          return `<li value="${id}" class='todo-item'>
                    <i onclick="handleUpdateCheckedTask(${id}, ${status})" class="${iconClasses} checkbox-btn" style="${styleClasses}"></i>
                    <input autocomplete="off" name="desc" type="text" class="${descClasses}" value="${description}">
                    <i onclick="handleDeleteTask(${id})" class="fa-regular fa-circle-xmark fa-lg delete-btn"></i>
                </li>`;
        })
        .join("");

      todoList.innerHTML = taskList;

      const taskUnCheckList = data.filter((item) => item.status === 0);
      const p = document.createElement("p");
      p.innerHTML = `You have ${taskUnCheckList.length} pending tasks`;
      p.classList.add("task-message");
      todoList.parentNode.appendChild(p);
      return;
    }

    console.log("Vui lòng kiểm tra đường link api");
  } catch (error) {
    console.log(error);
  }
  return;
};

const handleToastRender = (cookieValue, status = "success") => {
  const toasts = document.querySelector(".toasts");
  const div = document.createElement("div");
  status === "success"
    ? div.classList.add(`toast-block`)
    : div.classList.add(`toast-block`, "error");
  const iconClasses =
    status === "success"
      ? "fa-solid fa-circle-check fa-lg"
      : "fa-solid fa-circle-exclamation fa-lg";
  const iconColor = status === "success" ? "rgb(106 194 89)" : "#e24d31";
  const message =
    status === "success" ? `${cookieValue} Task` : "Vui Lòng Nhập Task";
  div.innerHTML = `<p class="toast-message"><i class='${iconClasses}' style="color: ${iconColor}; margin-right: 10px"></i><b>${
    status === "success" ? "Success" : "Error"
  }:</b> ${message}</p>`;
  toasts.appendChild(div);
};

const handleCreateTask = async () => {
  const inputTag = document.querySelector(".todo-form_input");

  if (!inputTag.value) {
    // const toastSuccess = document.querySelector(".toast-block");
    // if (toastSuccess) toastSuccess.remove();

    handleToastRender(null, "error");

    const toastError = document.querySelectorAll(".toasts .toast-block.error");
    if (toastError?.length) {
      setInterval(() => {
        toastError.forEach((toast) => {
          toast.remove();
        });
      }, 5000 - 50);
    }
    return;
  }

  const task = {
    status: 0,
    description: inputTag.value,
  };

  try {
    const taskApi = "http://localhost:3000/tasks";
    await fetch(taskApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    document.cookie = "typeToast=Created";
  } catch (error) {
    console.log(error);
  }
  return;
};

const handleDeleteTask = async (id) => {
  try {
    const taskApi = `http://localhost:3000/tasks/${id}`;
    await fetch(taskApi, {
      method: "DELETE",
    });

    document.cookie = "typeToast=Deleted";
  } catch (error) {
    console.log(error);
  }

  return;
};

const handleUpdateCheckedTask = async (id, status) => {
  const newStatus = !status ? 1 : 0;
  try {
    const taskApi = `http://localhost:3000/tasks/${id}`;
    await fetch(taskApi, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    document.cookie = "typeToast=Updated Status";
  } catch (error) {
    console.log(error);
  }
  return;
};

const handleUpdateInputTask = async (element, newDesc) => {
  const id = +element.getAttribute("value");
  const taskApi = `http://localhost:3000/tasks/${id}`;
  try {
    const getRespond = await fetch(taskApi);
    if (getRespond.status === 200) {
      const data = await getRespond.json();
      if (data.description !== newDesc) {
        await fetch(taskApi, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: newDesc,
          }),
        });

        document.cookie = "typeToast=Updated Description";
      }
    }
  } catch (error) {
    console.log(error);
  }
  return;
};

const customInputForm = () => {
  const inputList = document.querySelectorAll("input[name='desc']");
  inputList.forEach((item) => {
    item.disabled = true;

    item.ondblclick = () => {
      item.disabled = false;
      item.focus();
    };

    item.onblur = () => {
      item.disabled = true;
      handleUpdateInputTask(item.parentElement, item.value);
    };
  });
};

const start = async () => {
  await render();

  const toast = document.querySelector(".toast-block");
  if (toast) {
    setTimeout(() => {
      toast.remove();
      document.cookie = "typeToast=";
    }, 5000 - 50);
  }

  customInputForm();
};

start();
