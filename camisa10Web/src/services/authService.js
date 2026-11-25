import {
  salvarToken,
  obterToken,
  removerToken,
} from "./tokenStorage";

export { obterToken };

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Realiza uma requisição à API
async function requisicaoAPI(endpoint, metodo, dados = null, token = null) {
  if (!API_URL) {
    throw new Error("A URL da API não foi configurada.");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: metodo,
    headers,
    body: dados ? JSON.stringify(dados) : undefined,
  });

  const resultado = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resultado.detail || "Não foi possível realizar a operação."
    );
  }

  return resultado;
}

// Cadastro de usuário
export async function cadastrarUsuario(dados) {
  const resultado = await requisicaoAPI(
    "/api/auth/register",
    "POST",
    dados
  );

  if (resultado.access_token) {
    await salvarToken(resultado.access_token);
  }

  return resultado;
}


 // Login
export async function fazerLogin(email, senha) {
  const resultado = await requisicaoAPI(
    "/api/auth/login",
    "POST",
    { email, senha }
  );

  if (resultado.access_token) {
    await salvarToken(resultado.access_token);
  }

  return resultado;
}

// Login com Google
export async function fazerLoginGoogle(idToken) {
  const resultado = await requisicaoAPI(
    "/api/auth/google",
    "POST",
    { id_token: idToken }
  );

  if (resultado.access_token) {
    await salvarToken(resultado.access_token);
  }

  return resultado;
}


// Consulta o usuário autenticado
export async function obterUsuarioAutenticado() {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    "/api/auth/me",
    "GET",
    null,
    token
  );
}

// Realiza logout
export async function fazerLogout() {
  await removerToken();
}

export async function atualizarPerfil(dados) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.")
  }

  return await requisicaoAPI(
    "/api/auth/me",
    "PUT",
    dados,
    token
  );
}

export async function obterTimesDisponiveis() {
  return await requisicaoAPI(
    "/api/times",
    "GET"
  );
}

export async function atualizarFotoPerfil(uri) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  if (!API_URL) {
    throw new Error("A URL da API não foi configurada.");
  }

  try {
    // Transforma a imagem selecionada em um Blob
    const respostaArquivo = await fetch(uri);

    if (!respostaArquivo.ok) {
      throw new Error("Não foi possível acessar a imagem selecionada.");
    }

    const blob = await respostaArquivo.blob();

    // Identifica o formato real da imagem
    const tipo = blob.type || "image/jpeg";

    const extensoes = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };

    const extensao = extensoes[tipo] || "jpg";

    // Monta o envio multipart
    const formulario = new FormData();

    formulario.append(
      "arquivo",
      blob,
      `foto-perfil.${extensao}`
    );

    // Envia a imagem para a API
    const response = await fetch(
      `${API_URL}/api/auth/me/foto`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formulario,
      }
    );

    const resultado = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        resultado.detail ||
          "Não foi possível atualizar a foto de perfil."
      );
    }

    console.log("RESPOSTA DA API AO ENVIAR FOTO:", resultado);

    return resultado;
  } catch (error) {
    console.error("ERRO NO UPLOAD DA FOTO:", error);

    throw new Error(
      error.message || "Não foi possível enviar a foto."
    );
  }
}

export async function alterarSenha(senhaAtual, novaSenha) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    "/api/auth/me/senha",
    "PUT",
    {
      senha_atual: senhaAtual,
      nova_senha: novaSenha,
    },
    token
  );
}

export async function excluirConta(senha) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    "/api/auth/me",
    "DELETE",
    { senha },
    token
  );
}

export async function obterPlacarPersonalizado() {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    "/api/home/placar",
    "GET",
    null,
    token
  );
}

export async function obterNoticias(categoria = "todas") {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    `/api/news/?categoria=${encodeURIComponent(categoria)}`,
    "GET",
    null,
    token
  );

}

export async function obterEstatisticasGamificacao() {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    "/api/quiz/estatisticas",
    "GET",
    null,
    token
  );
}

export async function obterQuizzes() {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.")
  }

  return await requisicaoAPI(
    "/api/quiz/",
    "GET",
    null,
    token
  );
}

export async function obterPerguntasQuiz(codigoQuiz) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    `/api/quiz/${encodeURIComponent(codigoQuiz)}/perguntas`,
    "GET",
    null,
    token
  );
}

export async function enviarRespostasQuiz(codigoQuiz, respostas) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    "/api/quiz/responder",
    "POST",
    {
      codigo_quiz: codigoQuiz,
      respostas,
    },
    token
  );
}

export async function obterSequenciaQuiz() {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    "/api/quiz/sequencia",
    "GET",
    null,
    token
  );
}


// =========================================================
// ACERTE A ESCALAÇÃO
// =========================================================

// Busca o elenco de uma equipe
export async function obterElencoDesafio(teamId) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    `/api/desafio-escalacao/elenco/${teamId}`,
    "GET",
    null,
    token
  );
}

// Busca a previsão salva para uma partida
export async function obterPrevisaoEscalacao(fixtureId) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    `/api/desafio-escalacao/${fixtureId}/previsao`,
    "GET",
    null,
    token
  );
}

// Envia ou atualiza a previsão
export async function enviarPrevisaoEscalacao(fixtureId, dados) {
  const token = await obterToken();

  if (!token) {
    throw new Error("Nenhum usuário autenticado.");
  }

  return await requisicaoAPI(
    `/api/desafio-escalacao/${fixtureId}/previsao`,
    "POST",
    dados,
    token
  );
}
