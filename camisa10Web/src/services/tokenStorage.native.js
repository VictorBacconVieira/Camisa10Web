import * as SecureStore from "expo-secure-store";

const CHAVE_TOKEN = "camisa10_token";

export async function salvarToken(token) {
  return SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function obterToken() {
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

export async function removerToken() {
  return SecureStore.deleteItemAsync(CHAVE_TOKEN);
}
