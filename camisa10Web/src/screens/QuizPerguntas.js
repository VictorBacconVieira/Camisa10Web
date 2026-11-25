import { useEffect, useRef, useState } from "react";

import {
  Animated,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation, useRoute } from "@react-navigation/native";

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  CaretRightIcon,
} from "phosphor-react-native";

import { Texto } from "../components/texto";

import { SideBar } from "../components/sideBar";

import {
  obterPerguntasQuiz,
  enviarRespostasQuiz,
} from "../services/authService";

import { useTheme } from "../context/ThemeContext";
import { useAccessibility } from "../context/AccessibilityContext";

// ======================================================
// CONFETES
// ======================================================

function Confetes() {
  const { height, width } = useWindowDimensions();
  const { cores } = useTheme();

  const CORES_CONFETES = [
    cores.primary,
    cores.primaryHighlight,
    cores.text,
    cores.border,
    cores.warning,
  ];

  const particulas = useRef(
    Array.from({ length: 45 }, (_, index) => ({
      id: index,
      animacao: new Animated.Value(0),
      esquerda: Math.random() * 100,
      atraso: Math.random() * 1800,
      tamanho: Math.random() * 7 + 5,
      largura: Math.random() * 5 + 4,
      rotacao: Math.random() * 720 - 360,
      duracao: Math.random() * 1800 + 2200,
    }))
  ).current;

  useEffect(() => {
    const animacoes = particulas.map((particula) => {
      const animacao = Animated.loop(
        Animated.sequence([
          Animated.delay(particula.atraso),

          Animated.timing(particula.animacao, {
            toValue: 1,
            duration: particula.duracao,
            useNativeDriver: false,
          }),

          Animated.timing(particula.animacao, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );

      animacao.start();

      return animacao;
    });

    return () => {
      animacoes.forEach((animacao) => animacao.stop());
    };
  }, [particulas]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        elevation: 10,
      }}
    >
      {particulas.map((particula) => {
        const translateY = particula.animacao.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, height + 40],
        });

        const translateX = particula.animacao.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 35, -20],
        });

        const rotate = particula.animacao.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${particula.rotacao}deg`],
        });

        const opacity = particula.animacao.interpolate({
          inputRange: [0, 0.05, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={particula.id}
            style={{
              position: "absolute",
              top: 0,
              left: (particula.esquerda / 100) * width,
              width: particula.largura,
              height: particula.tamanho,
              borderRadius: 2,
              backgroundColor:
                CORES_CONFETES[
                  particula.id % CORES_CONFETES.length
                ],
              opacity,
              transform: [
                { translateY },
                { translateX },
                { rotate },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

// ======================================================
// LAYOUT WEB
// ======================================================

function LayoutQuiz({ children, cores }) {
  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{
        backgroundColor: cores.background,
      }}
    >
      <View
        className="flex-1 flex-row"
        style={{
          backgroundColor: cores.background,
        }}
      >
        <SideBar />

        <View
          className="flex-1"
          style={{
            minWidth: 0,
          }}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ======================================================
// TELA QUIZ
// ======================================================

export function QuizPerguntas() {
  const navigation = useNavigation();
  const route = useRoute();

  const { quizId, titulo } = route.params ?? {};

  const { cores } = useTheme();
  const { configuracoes } = useAccessibility();

  const escalaIcone =
    configuracoes.tamanhoTexto === "grande"
      ? 1.15
      : configuracoes.tamanhoTexto === "muitoGrande"
        ? 1.3
        : 1;

  const scrollRef = useRef(null);

  const scrollRefResultado = useRef(null);

  // ======================================================
  // ESTADOS
  // ======================================================

  const [perguntas, setPerguntas] = useState([]);

  const [carregandoPerguntas, setCarregandoPerguntas] =
    useState(true);

  const [erroPerguntas, setErroPerguntas] = useState(null);

  const [respostas, setRespostas] = useState([]);

  const [resultadoQuiz, setResultadoQuiz] = useState(null);

  const [erroEnvio, setErroEnvio] = useState(null);

  const [enviando, setEnviando] = useState(false);

  const [indicePergunta, setIndicePergunta] = useState(0);

  const [alternativaSelecionada, setAlternativaSelecionada] =
    useState(null);

  const [respostaConfirmada, setRespostaConfirmada] =
    useState(false);

  const [acertos, setAcertos] = useState(0);

  const [xp, setXp] = useState(0);

  const [finalizado, setFinalizado] = useState(false);

  // ======================================================
  // ANIMAÇÕES
  // ======================================================

  const animacaoConteudo = useRef(
    new Animated.Value(0)
  ).current;

  const animacaoFeedback = useRef(
    new Animated.Value(0)
  ).current;

  // ======================================================
  // DADOS
  // ======================================================

  const tituloExibicao = titulo || "Quiz";

  const perguntaAtual = perguntas[indicePergunta];

  const totalPerguntas = perguntas.length;

  const progresso =
    totalPerguntas > 0
      ? ((indicePergunta + 1) / totalPerguntas) * 100
      : 0;

  const atingiuMeta =
    totalPerguntas > 0 &&
    acertos >= Math.ceil(totalPerguntas / 2);

  // ======================================================
  // CARREGAMENTO DAS PERGUNTAS
  // ======================================================

  async function carregarPerguntas() {
    try {
      setCarregandoPerguntas(true);
      setErroPerguntas(null);

      const dados = await obterPerguntasQuiz(quizId);

      if (!Array.isArray(dados)) {
        throw new Error(
          "A API retornou um formato de perguntas inválido."
        );
      }

      setPerguntas(dados);

      setRespostas([]);

      setIndicePergunta(0);

      setAlternativaSelecionada(null);

      setRespostaConfirmada(false);

      setResultadoQuiz(null);

      setFinalizado(false);

      setAcertos(0);

      setXp(0);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);

      setErroPerguntas(error.message);
    } finally {
      setCarregandoPerguntas(false);
    }
  }

  useEffect(() => {
    if (quizId) {
      carregarPerguntas();
    } else {
      setErroPerguntas("Código do quiz não informado.");
      setCarregandoPerguntas(false);
    }
  }, [quizId]);

  // ======================================================
  // ANIMAÇÃO DE ENTRADA
  // ======================================================

  useEffect(() => {
    animacaoConteudo.setValue(0);

    Animated.timing(animacaoConteudo, {
      toValue: 1,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [indicePergunta, animacaoConteudo]);

  // ======================================================
  // ANIMAÇÃO DO FEEDBACK
  // ======================================================

  useEffect(() => {
    if (respostaConfirmada) {
      animacaoFeedback.setValue(0);

      Animated.spring(animacaoFeedback, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: false,
      }).start();
    }
  }, [respostaConfirmada, animacaoFeedback]);

  // ======================================================
  // ROLAGEM AUTOMÁTICA ATÉ O FEEDBACK
  // ======================================================

  useEffect(() => {
    if (!respostaConfirmada) return;

    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 150);

    return () => clearTimeout(timeout);
  }, [respostaConfirmada, indicePergunta]);

  // ======================================================
  // ROLAGEM DO RESULTADO
  // ======================================================

  useEffect(() => {
    if (!finalizado || !resultadoQuiz) return;

    requestAnimationFrame(() => {
      scrollRefResultado.current?.scrollTo({
        y: 0,
        animated: true,
      });
    });
  }, [finalizado, resultadoQuiz]);

  // ======================================================
  // ESTILOS ANIMADOS
  // ======================================================

  const estiloEntrada = {
    opacity: animacaoConteudo,

    transform: [
      {
        translateY: animacaoConteudo.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const estiloFeedback = {
    opacity: animacaoFeedback,

    transform: [
      {
        scale: animacaoFeedback.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1],
        }),
      },
      {
        translateY: animacaoFeedback.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  // ======================================================
  // CONFIRMAR RESPOSTA
  // ======================================================

  function confirmarResposta() {
    if (
      alternativaSelecionada === null ||
      respostaConfirmada ||
      !perguntaAtual
    ) {
      return;
    }

    setRespostas((valores) => [
      ...valores,
      {
        pergunta_id: perguntaAtual.id,
        resposta_selecionada: alternativaSelecionada,
      },
    ]);

    setRespostaConfirmada(true);
  }

  // ======================================================
  // FINALIZAR QUIZ
  // ======================================================

  async function finalizarQuiz() {
    if (
      enviando ||
      respostas.length !== totalPerguntas
    ) {
      return;
    }

    try {
      setEnviando(true);
      setErroEnvio(null);

      const resultado = await enviarRespostasQuiz(
        quizId,
        respostas
      );

      setResultadoQuiz(resultado);

      setAcertos(resultado.acertos);

      setXp(resultado.xp_total);

      setFinalizado(true);
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);

      setErroEnvio(error.message);
    } finally {
      setEnviando(false);
    }
  }

  // ======================================================
  // PRÓXIMA PERGUNTA
  // ======================================================

  function proximaPergunta() {
    if (!respostaConfirmada || enviando) return;

    if (indicePergunta < totalPerguntas - 1) {
      setIndicePergunta((valor) => valor + 1);

      setAlternativaSelecionada(null);

      setRespostaConfirmada(false);

      setErroEnvio(null);

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      });
    } else {
      finalizarQuiz();
    }
  }

  // ======================================================
  // REINICIAR QUIZ
  // ======================================================

  function reiniciarQuiz() {
    setIndicePergunta(0);

    setAlternativaSelecionada(null);

    setRespostaConfirmada(false);

    setRespostas([]);

    setResultadoQuiz(null);

    setErroEnvio(null);

    setAcertos(0);

    setXp(0);

    setFinalizado(false);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    });
  }

  // ======================================================
  // CARREGAMENTO
  // ======================================================

  if (carregandoPerguntas) {
    return (
      <LayoutQuiz cores={cores}>
        <View className="flex-1 items-center justify-center px-6">
          <Texto
            tamanho={16}
            className="font-semibold"
            style={{ color: cores.text }}
          >
            Carregando perguntas...
          </Texto>
        </View>
      </LayoutQuiz>
    );
  }

  // ======================================================
  // ERRO DE CARREGAMENTO
  // ======================================================

  if (erroPerguntas) {
    return (
      <LayoutQuiz cores={cores}>
        <View className="flex-1 items-center justify-center px-6">
          <View
            style={{
              width: "100%",
              maxWidth: 500,
            }}
          >
            <Texto
              tamanho={22}
              className="mb-3 font-bold text-center"
              style={{ color: cores.text }}
            >
              Não foi possível carregar o quiz
            </Texto>

            <Texto
              tamanho={16}
              className="text-center"
              style={{ color: cores.textSecondary }}
            >
              {erroPerguntas}
            </Texto>

            <Pressable
              onPress={carregarPerguntas}
              className="mt-6 items-center rounded-xl px-6 py-4"
              style={{
                backgroundColor: cores.primary,
              }}
            >
              <Texto
                tamanho={16}
                className="font-bold text-center"
                style={{ color: cores.background }}
              >
                Tentar novamente
              </Texto>
            </Pressable>

            <Pressable
              onPress={() => navigation.goBack()}
              className="mt-3 items-center rounded-xl border px-6 py-4"
              style={{
                borderColor: cores.border,
              }}
            >
              <Texto
                tamanho={16}
                className="font-semibold text-center"
                style={{ color: cores.text }}
              >
                Voltar aos quizzes
              </Texto>
            </Pressable>
          </View>
        </View>
      </LayoutQuiz>
    );
  }

  // ======================================================
  // QUIZ VAZIO
  // ======================================================

  if (perguntas.length === 0) {
    return (
      <LayoutQuiz cores={cores}>
        <View className="flex-1 items-center justify-center px-6">
          <View
            style={{
              width: "100%",
              maxWidth: 500,
            }}
          >
            <Texto
              tamanho={22}
              className="mb-3 font-bold text-center"
              style={{ color: cores.text }}
            >
              Quiz indisponível
            </Texto>

            <Texto
              tamanho={16}
              className="text-center"
              style={{ color: cores.textSecondary }}
            >
              Ainda não há perguntas cadastradas para este quiz.
            </Texto>

            <Pressable
              onPress={() => navigation.goBack()}
              className="mt-6 items-center rounded-xl px-6 py-4"
              style={{
                backgroundColor: cores.primary,
              }}
            >
              <Texto
                tamanho={16}
                className="font-bold text-center"
                style={{ color: cores.background }}
              >
                Voltar aos quizzes
              </Texto>
            </Pressable>
          </View>
        </View>
      </LayoutQuiz>
    );
  }

  // ======================================================
  // RESULTADO DO QUIZ
  // ======================================================

  if (finalizado && resultadoQuiz) {
    return (
      <LayoutQuiz cores={cores}>
        <View
          className="flex-1"
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {atingiuMeta && <Confetes />}

          <ScrollView
            ref={scrollRefResultado}
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              paddingHorizontal: 24,
              paddingTop: 35,
              paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 900,
                alignItems: "center",
              }}
            >
              {/* Resumo do resultado */}

              <View
                className="w-full items-center rounded-2xl border p-6"
                style={{
                  backgroundColor: cores.surface,
                  borderColor: cores.border,
                }}
              >
                <TrophyIcon
                  size={76 * escalaIcone}
                  color={
                    atingiuMeta
                      ? cores.primaryHighlight
                      : cores.danger
                  }
                  weight="fill"
                />

                <Texto
                  tamanho={30}
                  className="mt-5 font-bold text-center"
                  style={{ color: cores.text }}
                >
                  Quiz concluído!
                </Texto>

                <Texto
                  tamanho={16}
                  className="mt-3 text-center"
                  style={{ color: cores.textSecondary }}
                >
                  Você acertou {acertos} de {totalPerguntas} perguntas.
                </Texto>

                <Texto
                  tamanho={26}
                  className="mt-5 font-bold text-center"
                  style={{ color: cores.primaryHighlight }}
                >
                  +{xp.toLocaleString("pt-BR")} XP
                </Texto>

                {/* Indicador de desempenho */}

                <View
                  className="mt-6 w-full overflow-hidden rounded-full"
                  style={{
                    height: 10,
                    backgroundColor: cores.border,
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${(acertos / totalPerguntas) * 100}%`,
                      backgroundColor: atingiuMeta
                        ? cores.primary
                        : cores.danger,
                      borderRadius: 999,
                    }}
                  />
                </View>

                <Texto
                  tamanho={14}
                  className="mt-3 text-center"
                  style={{ color: cores.textSecondary }}
                >
                  {Math.round((acertos / totalPerguntas) * 100)}% de aproveitamento
                </Texto>
              </View>

              {/* Correção das respostas */}

              <View className="mt-8 w-full">
                <Texto
                  tamanho={20}
                  className="mb-4 font-bold"
                  style={{ color: cores.text }}
                >
                  Correção das respostas
                </Texto>

                {resultadoQuiz.resultados?.map(
                  (resultado, index) => {
                    const pergunta = perguntas.find(
                      (item) =>
                        item.id === resultado.pergunta_id
                    );

                    const alternativaCorreta =
                      pergunta?.alternativas?.[
                        resultado.resposta_correta
                      ];

                    const alternativaEscolhida =
                      pergunta?.alternativas?.[
                        resultado.resposta_selecionada
                      ];

                    const corStatus = resultado.correta
                      ? cores.primary
                      : cores.danger;

                    return (
                      <View
                        key={resultado.pergunta_id}
                        className="mb-4 rounded-xl border p-5"
                        style={{
                          backgroundColor: cores.surface,
                          borderColor: corStatus,
                        }}
                      >
                        {/* Cabeçalho da correção */}

                        <View className="mb-3 flex-row flex-wrap items-center">
                          {resultado.correta ? (
                            <CheckCircleIcon
                              size={24 * escalaIcone}
                              color={cores.primary}
                              weight="fill"
                            />
                          ) : (
                            <XCircleIcon
                              size={24 * escalaIcone}
                              color={cores.danger}
                              weight="fill"
                            />
                          )}

                          <View className="ml-2 flex-1">
                            <Texto
                              tamanho={14}
                              className="font-bold"
                              style={{ color: corStatus }}
                            >
                              Pergunta {index + 1} —{" "}
                              {resultado.correta
                                ? "Correta"
                                : "Incorreta"}
                            </Texto>
                          </View>

                          <Texto
                            tamanho={14}
                            className="font-bold"
                            style={{ color: cores.text }}
                          >
                            +{resultado.xp_ganho} XP
                          </Texto>
                        </View>

                        {/* Enunciado */}

                        <Texto
                          tamanho={17}
                          className="mb-3 font-semibold"
                          style={{ color: cores.text }}
                        >
                          {pergunta?.enunciado}
                        </Texto>

                        {/* Resposta escolhida */}

                        <View
                          className="rounded-lg p-3"
                          style={{
                            backgroundColor: cores.surfaceSecondary,
                          }}
                        >
                          <Texto
                            tamanho={14}
                            style={{ color: cores.textSecondary }}
                          >
                            Sua resposta
                          </Texto>

                          <Texto
                            tamanho={15}
                            className="mt-1 font-medium"
                            style={{
                              color: resultado.correta
                                ? cores.primary
                                : cores.danger,
                            }}
                          >
                            {alternativaEscolhida ??
                              "Não identificada"}
                          </Texto>
                        </View>

                        {/* Resposta correta */}

                        {!resultado.correta && (
                          <View
                            className="mt-2 rounded-lg p-3"
                            style={{
                              backgroundColor: cores.surfaceSecondary,
                            }}
                          >
                            <Texto
                              tamanho={14}
                              style={{ color: cores.textSecondary }}
                            >
                              Resposta correta
                            </Texto>

                            <Texto
                              tamanho={15}
                              className="mt-1 font-semibold"
                              style={{
                                color: cores.primaryHighlight,
                              }}
                            >
                              {alternativaCorreta ??
                                "Não identificada"}
                            </Texto>
                          </View>
                        )}

                        {/* Explicação */}

                        {!!resultado.explicacao && (
                          <View className="mt-4">
                            <Texto
                              tamanho={14}
                              className="mb-1 font-bold"
                              style={{ color: cores.text }}
                            >
                              Explicação
                            </Texto>

                            <Texto
                              tamanho={15}
                              style={{
                                color: cores.textSecondary,
                                lineHeight: 23,
                              }}
                            >
                              {resultado.explicacao}
                            </Texto>
                          </View>
                        )}
                      </View>
                    );
                  }
                )}
              </View>

              {/* Jogar novamente */}

              <Pressable
                onPress={reiniciarQuiz}
                className="mt-6 w-full items-center rounded-xl py-4"
                style={{
                  backgroundColor: cores.primary,
                }}
              >
                <Texto
                  tamanho={16}
                  className="font-bold text-center"
                  style={{ color: cores.background }}
                >
                  Jogar novamente
                </Texto>
              </Pressable>

              {/* Voltar */}

              <Pressable
                onPress={() => navigation.goBack()}
                className="mt-3 w-full items-center rounded-xl border py-4"
                style={{
                  borderColor: cores.border,
                  backgroundColor: cores.surface,
                }}
              >
                <Texto
                  tamanho={16}
                  className="font-semibold text-center"
                  style={{ color: cores.text }}
                >
                  Voltar aos quizzes
                </Texto>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </LayoutQuiz>
    );
  }

  // ======================================================
  // TELA PRINCIPAL DO QUIZ
  // ======================================================

  return (
    <LayoutQuiz cores={cores}>
      <View className="flex-1">
        {/* Cabeçalho */}

        <View
          className="px-5 pt-4"
          style={{
            width: "100%",
            maxWidth: 1100,
            alignSelf: "center",
          }}
        >
          <View className="flex-row flex-wrap items-center">
            <Pressable
              onPress={() => navigation.goBack()}
              className="mr-4 h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: cores.surface,
              }}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <ArrowLeftIcon
                size={22 * escalaIcone}
                color={cores.icon}
              />
            </Pressable>

            <View className="flex-1">
              <Texto
                tamanho={18}
                className="font-bold"
                style={{ color: cores.text }}
              >
                {tituloExibicao}
              </Texto>

              <Texto
                tamanho={12}
                className="mt-1"
                style={{ color: cores.textSecondary }}
              >
                Pergunta {indicePergunta + 1} de {totalPerguntas}
              </Texto>
            </View>

            {/* XP */}

            <View
              className="rounded-full px-3 py-2"
              style={{
                backgroundColor: cores.surfaceSecondary,
              }}
            >
              <Texto
                tamanho={14}
                className="font-bold"
                style={{ color: cores.primaryHighlight }}
              >
                {xp.toLocaleString("pt-BR")} XP
              </Texto>
            </View>
          </View>

          {/* Barra de progresso */}

          <View
            className="mt-6 w-full overflow-hidden rounded-full"
            style={{
              height: 10,
              backgroundColor: cores.border,
            }}
          >
            <View
              style={{
                height: 10,
                width: `${progresso}%`,
                backgroundColor: cores.primary,
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        {/* Conteúdo */}

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 50,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (respostaConfirmada) {
              scrollRef.current?.scrollToEnd({
                animated: true,
              });
            }
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1100,
              alignSelf: "center",
            }}
          >
            {/* Pergunta e alternativas */}

            <Animated.View style={estiloEntrada}>
              <Texto
                tamanho={14}
                className="mb-3 font-semibold uppercase tracking-wider"
                style={{ color: cores.primaryHighlight }}
              >
                Teste seus conhecimentos
              </Texto>

              <Texto
                tamanho={26}
                className="mb-7 font-bold"
                style={{
                  color: cores.text,
                  lineHeight: 36,
                }}
              >
                {perguntaAtual?.enunciado}
              </Texto>

              {/* Alternativas */}

              {perguntaAtual?.alternativas?.map(
                (alternativa, index) => {
                  const selecionada =
                    alternativaSelecionada === index;

                  return (
                    <Pressable
                      key={`${indicePergunta}-${index}`}
                      disabled={respostaConfirmada}
                      onPress={() =>
                        setAlternativaSelecionada(index)
                      }
                      className="mb-3 flex-row items-center rounded-xl border px-4 py-4"
                      style={{
                        backgroundColor: selecionada
                          ? cores.surfaceSecondary
                          : cores.surface,

                        borderColor: selecionada
                          ? cores.primary
                          : cores.border,

                        borderWidth: selecionada ? 1.5 : 1,

                        minHeight: 66,
                      }}
                    >
                      {/* Letra da alternativa */}

                      <View
                        className="mr-3 items-center justify-center rounded-lg"
                        style={{
                          width: 40 * escalaIcone,
                          height: 40 * escalaIcone,
                          backgroundColor: selecionada
                            ? cores.primary
                            : cores.surfaceSecondary,
                        }}
                      >
                        <Texto
                          tamanho={16}
                          className="font-bold"
                          style={{
                            color: selecionada
                              ? "#071018"
                              : cores.textSecondary,
                          }}
                        >
                          {String.fromCharCode(65 + index)}
                        </Texto>
                      </View>

                      {/* Texto */}

                      <Texto
                        tamanho={16}
                        className="flex-1 font-medium"
                        style={{
                          color: cores.text,
                          lineHeight: 24,
                        }}
                      >
                        {alternativa}
                      </Texto>
                    </Pressable>
                  );
                }
              )}
            </Animated.View>

            {/* Feedback da resposta */}

            {respostaConfirmada && (
              <Animated.View
                style={[
                  estiloFeedback,
                  {
                    backgroundColor: cores.surface,
                    borderColor: cores.primary,
                  },
                ]}
                className="mt-3 rounded-xl border p-5"
              >
                <View className="flex-row items-center">
                  <CheckCircleIcon
                    size={24}
                    color={cores.primary}
                    weight="fill"
                  />

                  <Texto
                    tamanho={16}
                    className="ml-2 font-bold"
                    style={{ color: cores.primaryHighlight }}
                  >
                    Resposta registrada!
                  </Texto>
                </View>

                <Texto
                  tamanho={15}
                  className="mt-3"
                  style={{
                    color: cores.textSecondary,
                    lineHeight: 23,
                  }}
                >
                  A correção e a explicação serão exibidas ao finalizar o quiz.
                </Texto>
              </Animated.View>
            )}

            {/* Erro ao enviar respostas */}

            {erroEnvio && (
              <View
                className="mt-4 rounded-xl border p-5"
                style={{
                  borderColor: cores.danger,
                  backgroundColor: cores.surfaceSecondary,
                }}
              >
                <Texto
                  tamanho={16}
                  className="font-semibold"
                  style={{ color: cores.danger }}
                >
                  Não foi possível finalizar o quiz.
                </Texto>

                <Texto
                  tamanho={15}
                  className="mt-2"
                  style={{
                    color: cores.textSecondary,
                    lineHeight: 23,
                  }}
                >
                  {erroEnvio}
                </Texto>
              </View>
            )}

            {/* Botões */}

            {!respostaConfirmada ? (
              <Pressable
                disabled={alternativaSelecionada === null}
                onPress={confirmarResposta}
                className="mt-6 items-center rounded-xl py-4"
                style={{
                  backgroundColor:
                    alternativaSelecionada === null
                      ? cores.surfaceSecondary
                      : cores.primary,
                  minHeight: 54,
                  justifyContent: "center",
                  opacity:
                    alternativaSelecionada === null
                      ? 0.7
                      : 1,
                }}
              >
                <Texto
                  tamanho={16}
                  className="font-bold text-center"
                  style={{
                    color:
                      alternativaSelecionada === null
                        ? cores.textTertiary
                        : "#071018",
                  }}
                >
                  Confirmar resposta
                </Texto>
              </Pressable>
            ) : (
              <Pressable
                disabled={enviando}
                onPress={proximaPergunta}
                className="mt-6 flex-row flex-wrap items-center justify-center rounded-xl py-4"
                style={{
                  backgroundColor: enviando
                    ? cores.surfaceSecondary
                    : cores.primary,
                  minHeight: 54,
                  justifyContent: "center",
                  opacity: enviando ? 0.7 : 1,
                }}
              >
                <Texto
                  tamanho={16}
                  className="mr-2 font-bold text-center"
                  style={{
                    color: enviando
                      ? cores.textTertiary
                      : "#071018",
                  }}
                >
                  {enviando
                    ? "Enviando respostas..."
                    : indicePergunta === totalPerguntas - 1
                      ? erroEnvio
                        ? "Tentar enviar novamente"
                        : "Ver resultado"
                      : "Próxima pergunta"}
                </Texto>

                {!enviando && (
                  <CaretRightIcon
                    size={20 * escalaIcone}
                    color="#071018"
                    weight="bold"
                  />
                )}
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </LayoutQuiz>
  );
}

export default QuizPerguntas;
