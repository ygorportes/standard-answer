document.addEventListener("DOMContentLoaded", function () {
  const selectCategoria = document.getElementById("selectCategoria");
  const grupoOpcaoInstalacao = document.getElementById(
    "grupoOpcaoInstalacao"
  );
  const selectOpcaoInstalacao = document.getElementById(
    "selectOpcaoInstalacao"
  );
  const grupoTemplate = document.getElementById("grupoTemplate");
  const selectTemplate = document.getElementById("selectTemplate");
  const camposDinamicos = document.getElementById("camposDinamicos");

  let dadosTemplates = null;
  let camposInputs = {};

  const btnGerar = document.getElementById("btnGerar");
  const btnCopiar = document.getElementById("btnCopiar");
  const btnLimpar = document.getElementById("btnLimpar");
  const textoResultado = document.getElementById("textoResultado");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalClose = document.getElementById("modalClose");
  const modalBtn = document.getElementById("modalBtn");
  const modalContent = modal.querySelector(".modal-content");

  function showModal(title, message, type = "info") {
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modalContent.classList.remove("success", "error", "info");

    if (type === "success") {
      modalContent.classList.add("success");
    } else if (type === "error") {
      modalContent.classList.add("error");
    }

    modal.classList.add("show");
  }

  function hideModal() {
    modal.classList.remove("show");
  }

  modalClose.addEventListener("click", hideModal);
  modalBtn.addEventListener("click", hideModal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      hideModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      hideModal();
    }
  });

  function carregarCategorias() {
    dadosTemplates.categorias.forEach(function (categoria) {
      const option = document.createElement("option");
      option.value = categoria.id;
      option.textContent = categoria.nome;
      selectCategoria.appendChild(option);
    });
  }

  function atualizarOpcaoInstalacao() {
    const categoriaSelecionada = selectCategoria.value;
    const mostrarOpcaoInstalacao = categoriaSelecionada === "instalacao";

    grupoOpcaoInstalacao.hidden = !mostrarOpcaoInstalacao;
    selectOpcaoInstalacao.disabled = !mostrarOpcaoInstalacao;

    if (!mostrarOpcaoInstalacao) {
      selectOpcaoInstalacao.value = "";
    }
  }

  function atualizarTemplates() {
    const categoriaSelecionada = selectCategoria.value;
    selectTemplate.innerHTML =
      '<option value="">-- Selecione um template --</option>';
    grupoTemplate.hidden = categoriaSelecionada === "agendamento";

    if (categoriaSelecionada && dadosTemplates) {
      const categoria = dadosTemplates.categorias.find(function (cat) {
        return cat.id === categoriaSelecionada;
      });

      if (categoria) {
        selectTemplate.disabled = false;
        categoria.templates.forEach(function (template) {
          const option = document.createElement("option");
          option.value = template.value;
          option.textContent = template.text;
          selectTemplate.appendChild(option);
        });

        if (categoriaSelecionada === "agendamento" && categoria.templates[0]) {
          selectTemplate.value = categoria.templates[0].value;
          criarCampos(categoria.templates[0]);
          return;
        }
      }
    } else {
      selectTemplate.disabled = true;
      selectTemplate.value = "";
    }

    esconderTodosCampos();
  }

  function esconderTodosCampos() {
    const todosCampos = camposDinamicos.querySelectorAll(".grupoDeCampos");
    todosCampos.forEach(function (campo) {
      campo.style.display = "none";
    });
  }

  function criarCampos(template) {
    esconderTodosCampos();

    if (template.campos && template.campos.length > 0) {
      template.campos.forEach(function (campoConfig) {
        let campoDiv = document.getElementById(campoConfig.campoId);

        if (!campoDiv) {
          campoDiv = document.createElement("div");
          campoDiv.id = campoConfig.campoId;
          campoDiv.className = "grupoDeCampos";
          camposDinamicos.appendChild(campoDiv);
        }

        let input = document.getElementById(campoConfig.id);

        if (!input) {
          const label = document.createElement("label");
          label.setAttribute("for", campoConfig.id);
          label.textContent = campoConfig.label;

          input = document.createElement("input");
          input.type = campoConfig.tipo;
          input.id = campoConfig.id;
          input.placeholder = campoConfig.placeholder;

          campoDiv.innerHTML = "";
          campoDiv.appendChild(label);
          campoDiv.appendChild(input);
        }

        campoDiv.style.display = "block";
        camposInputs[campoConfig.id] = input;
      });
    }
  }

  function substituirPlaceholders(mensagem, template) {
    let mensagemFinal = mensagem;

    if (template.campos) {
      template.campos.forEach(function (campoConfig) {
        const input = camposInputs[campoConfig.id];
        let valor = "...";

        if (input) {
          if (input.value && input.value.trim() !== "") {
            valor = input.value;
          } else {
            const placeholderMatch = campoConfig.placeholder.match(/Ex: (.+)/);
            valor = placeholderMatch ? placeholderMatch[1] : "...";
          }
        }

        const placeholder = "{" + campoConfig.id + "}";
        mensagemFinal = mensagemFinal.replace(
          new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          valor
        );
      });
    }

    mensagemFinal = mensagemFinal.replace(/{([^}]+)}/g, "...");

    return mensagemFinal;
  }

  function encontrarTemplate(templateValue) {
    if (!dadosTemplates) return null;

    for (let categoria of dadosTemplates.categorias) {
      const template = categoria.templates.find(function (t) {
        return t.value === templateValue;
      });
      if (template) return template;
    }
    return null;
  }

  function obterMensagemTemplate(template) {
    if (
      template.value === "pos-instalacao" &&
      selectOpcaoInstalacao.value === "pdvclisitef" &&
      template.mensagemPdvClisitef
    ) {
      return template.mensagemPdvClisitef;
    }

    return template.mensagem;
  }

  selectCategoria.addEventListener("change", function () {
    atualizarTemplates();
    atualizarOpcaoInstalacao();
  });

  selectTemplate.addEventListener("change", function () {
    const templateSelecionado = selectTemplate.value;

    if (templateSelecionado) {
      const template = encontrarTemplate(templateSelecionado);
      if (template) {
        criarCampos(template);
      }
    } else {
      esconderTodosCampos();
    }
  });

  btnGerar.addEventListener("click", function () {
    const categoriaSelecionada = selectCategoria.value;
    const templateSelecionado = selectTemplate.value;

    if (!categoriaSelecionada) {
      showModal(
        "Atenção",
        "Por favor, selecione uma categoria primeiro.",
        "error"
      );
      return;
    }

    if (!templateSelecionado) {
      showModal(
        "Atenção",
        "Por favor, selecione um template primeiro.",
        "error"
      );
      return;
    }

    const template = encontrarTemplate(templateSelecionado);

    if (!template) {
      showModal("Erro", "Template não encontrado.", "error");
      return;
    }

    let textoFinal = substituirPlaceholders(obterMensagemTemplate(template), template);

    textoResultado.value = textoFinal;

    textoResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  btnCopiar.addEventListener("click", function () {
    if (!textoResultado.value || textoResultado.value.trim() === "") {
      showModal(
        "Atenção",
        "Não há texto para copiar. Gere uma resposta primeiro.",
        "error"
      );
      return;
    }

    textoResultado.select();
    navigator.clipboard
      .writeText(textoResultado.value)
      .then(function () {
        showModal(
          "Sucesso!",
          "Texto copiado para a área de transferência!",
          "success"
        );
      })
      .catch(function (err) {
        showModal(
          "Erro",
          "Não foi possível copiar o texto. Tente novamente.",
          "error"
        );
        console.error("Erro ao copiar:", err);
      });
  });

  btnLimpar.addEventListener("click", function () {
    selectCategoria.value = "";
    atualizarOpcaoInstalacao();
    grupoTemplate.hidden = false;
    selectTemplate.value = "";
    selectTemplate.disabled = true;
    selectTemplate.innerHTML =
      '<option value="">-- Selecione um template --</option>';
    selectOpcaoInstalacao.value = "";

    Object.keys(camposInputs).forEach(function (inputId) {
      if (camposInputs[inputId]) {
        camposInputs[inputId].value = "";
      }
    });

    textoResultado.value = "";

    esconderTodosCampos();

    showModal("Sucesso!", "Formulário limpo com sucesso!", "success");

    selectCategoria.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  fetch("src/data/templates.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Erro ao carregar templates");
      }
      return response.json();
    })
    .then(function (data) {
      dadosTemplates = data;
      carregarCategorias();
    })
    .catch(function (error) {
      console.error("Erro ao carregar templates:", error);
      showModal(
        "Erro",
        "Não foi possível carregar os templates. Por favor, recarregue a página.",
        "error"
      );
    });
});
