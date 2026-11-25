import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import {
  ArrowLeftIcon,
  ArrowUpIcon,
  LightbulbIcon,
  PlusIcon,
  SoccerBallIcon,
  SparkleIcon,
} from "phosphor-react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../context/ThemeContext";
import { useAccessibility } from "../context/AccessibilityContext";

import { Texto } from "../components/texto";
import { SideBar } from "../components/sideBar";

export function Chatbot() {
  const { cores } = useTheme();
  const { fontScale, configuracoes } = useAccessibility();
  const navigation = useNavigation();

  const scrollRef = useRef(null);

  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [digitando, setDigitando] = useState(false);

  // Ajustes de acessibilidade.
  const escalaIcone =
    configuracoes.tamanhoTexto === "grande"
      ? 1.15
      : configuracoes.tamanhoTexto === "muitoGrande"
        ? 1.3
        : 1;

  const fontFamily = configuracoes.textoNegrito
    ? "AnuphanBold"
    : "Anuphan";

  // =====================================================
  // SUGESTÕES DE CONVERSA
  // =====================================================

  const sugestoes = [
    {
      id: "1",
      titulo: "Notícias do meu time",
      descricao: "Fique por dentro do seu clube.",
      pergunta: "Quais são as últimas notícias do meu time?",
      icone: "newspaper",
    },
    {
      id: "2",
      titulo: "Destaques da rodada",
      descricao: "Confira os principais acontecimentos.",
      pergunta: "Quem foram os destaques da última rodada?",
      icone: "trophy",
    },
    {
      id: "3",
      titulo: "História do futebol",
      descricao: "Explore histórias e curiosidades.",
      pergunta: "Conte uma curiosidade sobre a história do futebol.",
      icone: "book",
    },
    {
      id: "4",
      titulo: "Regras do futebol",
      descricao: "Entenda as regras do jogo.",
      pergunta: "Explique a regra do impedimento.",
      icone: "lightbulb",
    },
  ];

  // =====================================================
  // ROLAGEM AUTOMÁTICA
  // =====================================================

  useEffect(() => {
    if (mensagens.length > 0 || digitando) {
      const timeout = setTimeout(() => {
        scrollRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [mensagens, digitando]);

  // =====================================================
  // ENVIO DE MENSAGENS
  // =====================================================

  async function enviarMensagem(texto = mensagem) {
    const textoEnviado = texto.trim();

    if (!textoEnviado || digitando) return;

    const gerarId = (prefixo) =>
      `${prefixo}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    const novaMensagem = {
      id: gerarId("usuario"),
      texto: textoEnviado,
      autor: "usuario",
    };

    setMensagens((anteriores) => [
      ...anteriores,
      novaMensagem,
    ]);

    setMensagem("");
    setDigitando(true);

    try {
      const respostaApi = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            pergunta: textoEnviado,
          }),
        }
      );

      if (!respostaApi.ok) {
        throw new Error(`Erro HTTP ${respostaApi.status}`);
      }

      const dados = await respostaApi.json();

      if (
        typeof dados.response !== "string" ||
        !dados.response.trim()
      ) {
        throw new Error(
          "A API não retornou uma resposta válida."
        );
      }

      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: gerarId("ia"),
          texto: dados.response,
          autor: "ia",
        },
      ]);
    } catch (erro) {
      console.error(
        "Erro ao consultar o Camisa10:",
        erro
      );

      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: gerarId("erro"),
          texto:
            "Não consegui obter uma resposta agora. Tente novamente em instantes.",
          autor: "ia",
        },
      ]);
    } finally {
      setDigitando(false);
    }
  }

  function selecionarSugestao(pergunta) {
    setMensagem(pergunta);
  }

  const conversaIniciada = mensagens.length > 0;

  // =====================================================
  // COMPONENTES VISUAIS
  // =====================================================

  function IconeAssistente({ tamanho = 22 }) {
    return (
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: cores.surfaceSecondary,
          borderWidth: 1,
          borderColor: cores.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SoccerBallIcon
          size={tamanho * escalaIcone}
          color="#39FF14"
        />
      </View>
    );
  }

  function IconeSugestao({ tipo }) {
    let Icone = LightbulbIcon;

    if (tipo === "newspaper") {
      Icone = SparkleIcon;
    }

    if (tipo === "trophy") {
      Icone = SoccerBallIcon;
    }

    if (tipo === "book") {
      Icone = LightbulbIcon;
    }

    if (tipo === "lightbulb") {
      Icone = LightbulbIcon;
    }

    return (
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: cores.surfaceSecondary,
          borderWidth: 1,
          borderColor: cores.border,
        }}
      >
        <Icone
          size={23 * escalaIcone}
          color="#39FF14"
        />
      </View>
    );
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: cores.background,
      }}
      edges={["top", "bottom"]}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: cores.background,
        }}
      >
        {/* SIDEBAR */}
        <SideBar />

        {/* ÁREA PRINCIPAL */}
        <View
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <KeyboardAvoidingView
            style={{
              flex: 1,
            }}
            behavior={
              Platform.OS === "android"
                ? "padding"
                : undefined
            }
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                alignSelf: "center",
              }}
            >
              {/* =====================================================
                  CABEÇALHO
              ===================================================== */}

              <View
                style={{
                  minHeight: 76,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 28,
                  borderBottomWidth: 1,
                  borderBottomColor: cores.border,
                  backgroundColor: cores.background,
                }}
              >
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={({ pressed }) => ({
                    width: 42,
                    height: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 13,
                    backgroundColor: cores.surface,
                    borderWidth: 1,
                    borderColor: cores.border,
                    marginRight: 14,
                    opacity: pressed ? 0.7 : 1,
                    transform: [
                      {
                        scale: pressed ? 0.96 : 1,
                      },
                    ],
                  })}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                >
                  <ArrowLeftIcon
                    size={22 * escalaIcone}
                    color={cores.icon}
                  />
                </Pressable>

                <IconeAssistente tamanho={22} />

                <View
                  style={{
                    marginLeft: 13,
                    flex: 1,
                  }}
                >
                  <Texto
                    tamanho={17}
                    style={{
                      color: cores.text,
                      fontFamily,
                    }}
                  >
                    Camisa10 IA
                  </Texto>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 3,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 10,
                        backgroundColor: "#39FF14",
                        marginRight: 7,
                      }}
                    />

                    <Texto
                      tamanho={12}
                      style={{
                        color: cores.textSecondary,
                        fontFamily,
                      }}
                    >
                      Seu assistente de futebol
                    </Texto>
                  </View>
                </View>

                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    backgroundColor: cores.surface,
                    borderWidth: 1,
                    borderColor: cores.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SparkleIcon
                    size={21 * escalaIcone}
                    color="#39FF14"
                  />
                </View>
              </View>

              {/* =====================================================
                  CONVERSA
              ===================================================== */}

              <ScrollView
                ref={scrollRef}
                style={{
                  flex: 1,
                }}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingHorizontal: 24,
                  paddingTop: 32,
                  paddingBottom: 30,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  if (conversaIniciada || digitando) {
                    scrollRef.current?.scrollToEnd({
                      animated: true,
                    });
                  }
                }}
              >
                {/* =====================================================
                    APRESENTAÇÃO INICIAL
                ===================================================== */}

                {!conversaIniciada && (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      width: "100%",
                      maxWidth: 940,
                      alignSelf: "center",
                    }}
                  >
                    {/* APRESENTAÇÃO */}

                    <View
                      style={{
                        alignItems: "center",
                        marginBottom: 36,
                      }}
                    >
                      <View
                        style={{
                          width: 96 * escalaIcone,
                          height: 96 * escalaIcone,
                          borderRadius: 30,
                          backgroundColor: cores.surface,
                          borderWidth: 1,
                          borderColor: cores.border,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 24,
                        }}
                      >
                        <SoccerBallIcon
                          size={52 * escalaIcone}
                          color="#39FF14"
                        />
                      </View>

                      <Texto
                        tamanho={32}
                        style={{
                          color: cores.text,
                          textAlign: "center",
                          fontFamily,
                          marginBottom: 12,
                        }}
                      >
                        Fala, torcedor!
                      </Texto>

                      <Texto
                        tamanho={15}
                        style={{
                          color: cores.textSecondary,
                          textAlign: "center",
                          lineHeight: 25,
                          maxWidth: 520,
                          fontFamily,
                        }}
                      >
                        Sou o Camisa10 IA, seu parceiro para
                        conversar sobre futebol. O que vamos
                        discutir hoje?
                      </Texto>
                    </View>

                    {/* CARD DE APRESENTAÇÃO */}

                    <View
                      style={{
                        borderRadius: 20,
                        padding: 22,
                        backgroundColor: cores.surface,
                        borderWidth: 1,
                        borderColor: cores.border,
                        marginBottom: 30,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            backgroundColor: cores.surfaceSecondary,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <LightbulbIcon
                            size={21 * escalaIcone}
                            color="#39FF14"
                          />
                        </View>

                        <Texto
                          tamanho={16}
                          style={{
                            color: cores.text,
                            fontFamily,
                          }}
                        >
                          Explore o mundo do futebol
                        </Texto>
                      </View>

                      <Texto
                        tamanho={14}
                        style={{
                          color: cores.textSecondary,
                          lineHeight: 24,
                          fontFamily,
                        }}
                      >
                        Descubra curiosidades, explore a história
                        dos clubes, entenda as regras e converse
                        sobre o mundo da bola.
                      </Texto>
                    </View>

                    {/* SUGESTÕES */}

                    <View>
                      <Texto
                        tamanho={17}
                        style={{
                          color: cores.text,
                          fontFamily,
                          marginBottom: 16,
                        }}
                      >
                        Por onde vamos começar?
                      </Texto>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 14,
                        }}
                      >
                        {sugestoes.map((sugestao) => (
                          <Pressable
                            key={sugestao.id}
                            onPress={() =>
                              selecionarSugestao(
                                sugestao.pergunta
                              )
                            }
                            style={({ pressed }) => ({
                              flexGrow: 1,
                              flexBasis: 300,
                              minWidth: 0,
                              borderRadius: 18,
                              borderWidth: 1,
                              borderColor: cores.border,
                              backgroundColor: cores.surface,
                              padding: 17,
                              opacity: pressed ? 0.75 : 1,
                              transform: [
                                {
                                  scale: pressed ? 0.985 : 1,
                                },
                              ],
                            })}
                            accessibilityRole="button"
                            accessibilityLabel={
                              sugestao.pergunta
                            }
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 14,
                              }}
                            >
                              <IconeSugestao
                                tipo={sugestao.icone}
                              />

                              <View
                                style={{
                                  marginLeft: "auto",
                                  width: 30,
                                  height: 30,
                                  borderRadius: 10,
                                  backgroundColor:
                                    cores.surfaceSecondary,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ArrowUpIcon
                                  size={16}
                                  color={cores.textSecondary}
                                  style={{
                                    transform: [
                                      {
                                        rotate: "45deg",
                                      },
                                    ],
                                  }}
                                />
                              </View>
                            </View>

                            <Texto
                              tamanho={15}
                              style={{
                                color: cores.text,
                                fontFamily,
                                marginBottom: 5,
                              }}
                            >
                              {sugestao.titulo}
                            </Texto>

                            <Texto
                              tamanho={12}
                              style={{
                                color: cores.textSecondary,
                                fontFamily,
                                lineHeight: 20,
                              }}
                            >
                              {sugestao.descricao}
                            </Texto>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* =====================================================
                    MENSAGENS
                ===================================================== */}

                {conversaIniciada && (
                  <View
                    style={{
                      width: "100%",
                      maxWidth: 900,
                      alignSelf: "center",
                      gap: 22,
                    }}
                  >
                    {mensagens.map((item) => {
                      const mensagemUsuario =
                        item.autor === "usuario";

                      return (
                        <View
                          key={item.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-end",
                            justifyContent: mensagemUsuario
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          {/* ÍCONE DA IA */}

                          {!mensagemUsuario && (
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                backgroundColor: cores.surface,
                                borderWidth: 1,
                                borderColor: cores.border,
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                                marginBottom: 3,
                              }}
                            >
                              <SparkleIcon
                                size={19 * escalaIcone}
                                color="#39FF14"
                              />
                            </View>
                          )}

                          {/* BALÃO */}

                          <View
                            style={{
                              maxWidth: "78%",
                              borderRadius: 20,
                              borderBottomRightRadius:
                                mensagemUsuario ? 5 : 20,
                              borderBottomLeftRadius:
                                mensagemUsuario ? 20 : 5,
                              paddingHorizontal: 18,
                              paddingVertical: 14,
                              backgroundColor: mensagemUsuario
                                ? cores.primary
                                : cores.surface,
                              borderWidth: mensagemUsuario
                                ? 0
                                : 1,
                              borderColor: cores.border,
                            }}
                          >
                            <Texto
                              tamanho={14}
                              style={{
                                color: mensagemUsuario
                                  ? "#FFFFFF"
                                  : cores.text,
                                lineHeight: 24,
                                fontFamily,
                              }}
                            >
                              {item.texto}
                            </Texto>
                          </View>
                        </View>
                      );
                    })}

                    {/* INDICADOR DE DIGITAÇÃO */}

                    {digitando && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-end",
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            backgroundColor: cores.surface,
                            borderWidth: 1,
                            borderColor: cores.border,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                          }}
                        >
                          <SparkleIcon
                            size={19 * escalaIcone}
                            color="#39FF14"
                          />
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderRadius: 18,
                            borderBottomLeftRadius: 5,
                            borderWidth: 1,
                            borderColor: cores.border,
                            backgroundColor: cores.surface,
                            paddingHorizontal: 16,
                            paddingVertical: 13,
                          }}
                        >
                          <ActivityIndicator
                            size="small"
                            color="#39FF14"
                          />

                          <Texto
                            tamanho={12}
                            style={{
                              color: cores.textSecondary,
                              marginLeft: 10,
                              fontFamily,
                            }}
                          >
                            Camisa10 IA está digitando...
                          </Texto>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* =====================================================
                  CAMPO DE ENVIO
              ===================================================== */}

              <View
                style={{
                  width: "100%",
                  borderTopWidth: 1,
                  borderTopColor: cores.border,
                  backgroundColor: cores.background,
                  paddingHorizontal: 24,
                  paddingTop: 16,
                  paddingBottom: 12,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    maxWidth: 940,
                    alignSelf: "center",
                  }}
                >
                  {/* INPUT */}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-end",
                      borderWidth: 1,
                      borderColor: cores.border,
                      borderRadius: 20,
                      backgroundColor: cores.surface,
                      padding: 8,
                    }}
                  >
                    {/* ANEXO */}

                    <Pressable
                      onPress={() => {
                        // FUTURO:
                        // Permitir anexar imagens ou arquivos.
                      }}
                      style={({ pressed }) => ({
                        width: 42 * escalaIcone,
                        height: 42 * escalaIcone,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 13,
                        marginBottom: 1,
                        opacity: pressed ? 0.6 : 1,
                      })}
                      accessibilityRole="button"
                      accessibilityLabel="Adicionar anexo"
                    >
                      <PlusIcon
                        size={23 * escalaIcone}
                        color={cores.textSecondary}
                      />
                    </Pressable>

                    {/* TEXTO */}

                    <TextInput
                      value={mensagem}
                      onChangeText={setMensagem}
                      placeholder="Pergunte sobre futebol..."
                      placeholderTextColor={cores.textTertiary}
                      multiline
                      maxLength={2000}
                      editable={!digitando}
                      style={{
                        flex: 1,
                        minHeight: 44,
                        maxHeight: 150,
                        paddingHorizontal: 12,
                        paddingVertical: 11,
                        color: cores.text,
                        fontFamily,
                        fontSize: 14 * fontScale,
                        lineHeight: Math.ceil(
                          14 * fontScale * 1.5
                        ),
                        textAlignVertical: "center",
                        outlineStyle: "none",
                      }}
                      accessibilityLabel="Digite sua pergunta"
                      returnKeyType="default"
                    />

                    {/* ENVIAR */}

                    <Pressable
                      onPress={() => enviarMensagem()}
                      disabled={!mensagem.trim() || digitando}
                      style={({ pressed }) => ({
                        width: 44 * escalaIcone,
                        height: 44 * escalaIcone,
                        borderRadius: 14,
                        backgroundColor: cores.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 1,
                        opacity:
                          !mensagem.trim() || digitando
                            ? 0.4
                            : pressed
                              ? 0.75
                              : 1,
                        transform: [
                          {
                            scale: pressed ? 0.94 : 1,
                          },
                        ],
                      })}
                      accessibilityRole="button"
                      accessibilityLabel="Enviar mensagem"
                    >
                      <ArrowUpIcon
                        size={24 * escalaIcone}
                        color="#071018"
                        weight="bold"
                      />
                    </Pressable>
                  </View>

                  {/* RODAPÉ */}

                  <Texto
                    tamanho={11}
                    style={{
                      color: cores.textTertiary,
                      textAlign: "center",
                      marginTop: 11,
                      fontFamily,
                    }}
                  >
                    Camisa10 IA · Seu parceiro no mundo da bola
                  </Texto>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}