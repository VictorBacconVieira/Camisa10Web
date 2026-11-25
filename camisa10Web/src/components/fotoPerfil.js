
import { useState } from "react";

import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
} from "react-native";

import {
  ImagesIcon,
  XIcon,
  WarningCircleIcon,
  UserIcon,
  CaretRightIcon,
} from "phosphor-react-native";

import { useTheme } from "../context/ThemeContext";

export function FotoPerfil({
  foto,
  nome = "",
  onFotoSelecionada,
  tamanho = 112,
}) {
  const { cores } = useTheme();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  // =====================================================
  // SELECIONAR IMAGEM DO COMPUTADOR
  // =====================================================

  function selecionarGaleria() {
    setMensagemErro("");

    const input = document.getElementById("foto-perfil-input");

    if (input) {
      input.click();
    }
  }

  // =====================================================
  // PROCESSAR ARQUIVO SELECIONADO
  // =====================================================

  function processarArquivo(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    // Valida o tipo do arquivo
    if (!arquivo.type.startsWith("image/")) {
      setMensagemErro("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    // Limite de 5 MB
    if (arquivo.size > 5 * 1024 * 1024) {
      setMensagemErro("A imagem deve possuir no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setMensagemErro("");

    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = leitor.result;

      if (typeof imagem === "string") {
        onFotoSelecionada?.(imagem);

        setModalVisivel(false);
        setMensagemErro("");
      }
    };

    leitor.onerror = () => {
      setMensagemErro("Não foi possível carregar a imagem.");
    };

    leitor.readAsDataURL(arquivo);

    // Permite selecionar novamente o mesmo arquivo
    event.target.value = "";
  }

  // =====================================================
  // FECHAR MODAL
  // =====================================================

  function fecharModal() {
    setModalVisivel(false);
    setMensagemErro("");
  }

  // =====================================================
  // COMPONENTE
  // =====================================================

  return (
    <>
      {/* INPUT DE ARQUIVO WEB */}

      <input
        id="foto-perfil-input"
        type="file"
        accept="image/*"
        onChange={processarArquivo}
        style={{
          display: "none",
        }}
      />

      {/* =================================================
          FOTO DE PERFIL
      ================================================= */}

      <View
        style={{
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => setModalVisivel(true)}
          accessibilityRole="button"
          accessibilityLabel="Alterar foto de perfil"
          style={({ pressed }) => ({
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2,
            backgroundColor: cores.surfaceSecondary,
            borderWidth: 3,
            borderColor: cores.primary,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          {foto ? (
            <Image
              source={{ uri: foto }}
              style={{
                width: tamanho - 6,
                height: tamanho - 6,
                borderRadius: tamanho / 2,
              }}
              resizeMode="cover"
            />
          ) : (
            <UserIcon
              size={tamanho * 0.45}
              color={cores.primary}
              weight="regular"
            />
          )}
        </Pressable>

        <Text
          style={{
            color: cores.textSecondary,
            fontSize: 13,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          Toque na foto para alterá-la
        </Text>
      </View>

      {/* =================================================
          MODAL DE SELEÇÃO
      ================================================= */}

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={fecharModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: cores.overlay,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          {/* FUNDO CLICÁVEL */}

          <Pressable
            onPress={fecharModal}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />

          {/* CARD DO MODAL */}

          <View
            style={{
              backgroundColor: cores.surface,
              borderRadius: 22,
              padding: 24,
              borderWidth: 1,
              borderColor: cores.border,
              width: "100%",
              maxWidth: 420,
              alignSelf: "center",
            }}
          >
            {/* CABEÇALHO */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 14,
                    backgroundColor: "rgba(0,200,83,0.12)",
                    borderWidth: 1,
                    borderColor: "rgba(0,200,83,0.25)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <ImagesIcon
                    size={24}
                    color={cores.primary}
                    weight="fill"
                  />
                </View>

                <View>
                  <Text
                    style={{
                      color: cores.text,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    Foto de perfil
                  </Text>

                  <Text
                    style={{
                      color: cores.textSecondary,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    Personalize sua conta
                  </Text>
                </View>
              </View>

              {/* BOTÃO FECHAR */}

              <Pressable
                onPress={fecharModal}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Fechar modal"
                style={({ pressed }) => ({
                  width: 35,
                  height: 35,
                  borderRadius: 11,
                  backgroundColor: cores.surfaceSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <XIcon
                  size={20}
                  color={cores.icon}
                />
              </Pressable>
            </View>

            {/* DESCRIÇÃO */}

            <Text
              style={{
                color: cores.textSecondary,
                fontSize: 13,
                lineHeight: 19,
                marginBottom: 20,
              }}
            >
              Escolha uma imagem do seu computador para deixar
              seu perfil com a sua cara.
            </Text>

            {/* SELECIONAR ARQUIVO */}

            <Pressable
              onPress={selecionarGaleria}
              accessibilityRole="button"
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? "rgba(0,200,83,0.10)"
                  : cores.surfaceSecondary,
                borderWidth: 1,
                borderColor: pressed
                  ? cores.primary
                  : cores.border,
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              {/* ÍCONE */}

              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: "rgba(0,200,83,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImagesIcon
                  size={25}
                  color={cores.primary}
                  weight="fill"
                />
              </View>

              {/* TEXTOS */}

              <View
                style={{
                  flex: 1,
                  marginLeft: 13,
                }}
              >
                <Text
                  style={{
                    color: cores.text,
                    fontSize: 14,
                    fontWeight: "800",
                  }}
                >
                  Escolher imagem
                </Text>

                <Text
                  style={{
                    color: cores.textSecondary,
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  Buscar uma foto no computador
                </Text>
              </View>

              <CaretRightIcon
                size={21}
                color={cores.textSecondary}
              />
            </Pressable>

            {/* LIMITE DE TAMANHO */}

            <Text
              style={{
                color: cores.textTertiary,
                fontSize: 11,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              Tamanho máximo permitido: 5 MB
            </Text>

            {/* ERRO */}

            {!!mensagemErro && (
              <View
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "rgba(229,57,53,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(229,57,53,0.35)",
                  flexDirection: "row",
                  alignItems: "flex-start",
                }}
              >
                <WarningCircleIcon
                  size={20}
                  color={cores.danger}
                  weight="fill"
                />

                <Text
                  style={{
                    color: cores.text,
                    fontSize: 12,
                    lineHeight: 18,
                    flex: 1,
                    marginLeft: 9,
                  }}
                >
                  {mensagemErro}
                </Text>
              </View>
            )}

            {/* CANCELAR */}

            <Pressable
              onPress={fecharModal}
              style={({ pressed }) => ({
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 13,
                marginTop: 10,
                borderRadius: 12,
                backgroundColor: pressed
                  ? cores.surfaceSecondary
                  : "transparent",
              })}
            >
              <Text
                style={{
                  color: cores.textSecondary,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
