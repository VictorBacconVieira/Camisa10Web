const CHAVE_TOKEN = "camisa10_token";

export async function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export async function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export async function removerToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}
