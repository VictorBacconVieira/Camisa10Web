import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { Texto } from "../components/texto";

import {
  ArrowLeftIcon,
  QuestionIcon,
  TrophyIcon,
  CaretRightIcon,
  GlobeHemisphereWestIcon,
  FlagIcon,
} from "phosphor-react-native";

import { SideBar } from "../components/sideBar";

import { useAccessibility } from "../context/AccessibilityContext";
import { useTheme } from "../context/ThemeContext";

const quizzesDiarios = [
  {
    id: "quiz-dia",
    titulo: "Quiz do Dia",
    icone: QuestionIcon,
    cor: "#00C853",
    destaque: true,
  },
];

const categorias = [
  {
    id: "brasileirao",
    titulo: "Brasileirão",
    icone: TrophyIcon,
    cor: "#39FF14",
  },
  {
    id: "copa-brasil",
    titulo: "Copa do Brasil",
    icone: TrophyIcon,
    cor: "#FFC107",
  },
  {
    id: "selecao-brasil",
    titulo: "Seleção Brasileira - História",
    icone: FlagIcon,
    cor: "#00C853",
  },
  {
    id: "copa-mundo",
    titulo: "Copa do Mundo",
    icone: GlobeHemisphereWestIcon,
    cor: "#FFC107",
  },
  {
    id: "champions",
    titulo: "Champions League",
    icone: TrophyIcon,
    cor: "#7B8CFF",
  },
  {
    id: "laliga",
    titulo: "La Liga",
    icone: TrophyIcon,
    cor: "#E53935",
  },
];

export function Quiz() {
  const navigation = useNavigation();

  const { configuracoes } = useAccessibility();
  const { cores } = useTheme();

  const escalaIcone =
    configuracoes.tamanhoTexto === "grande"
      ? 1.15
      : configuracoes.tamanhoTexto === "muitoGrande"
        ? 1.3
        : 1;

  function abrirQuiz(id, titulo) {
    navigation.navigate("QuizPerguntas", {
      quizId: id,
      titulo,
    });
  }

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{
        backgroundColor: cores.background,
      }}
    >
      <View className="flex-1 flex-row">

        {/* Sidebar */}
        <SideBar />

        {/* Conteúdo */}
        <ScrollView
          style={{
            flex: 1,
            minWidth: 0,
          }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 40,
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 1100,
            }}
          >

            {/* Cabeçalho */}
            <View
              className="flex-row items-center pb-4 pt-5"
            >
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                style={({ pressed }) => ({
                  width: 42,
                  height: 42,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  backgroundColor: pressed
                    ? cores.surfaceSecondary
                    : "transparent",
                  opacity: pressed ? 0.7 : 1,
                  transform: [
                    {
                      scale: pressed ? 0.92 : 1,
                    },
                  ],
                })}
              >
                <ArrowLeftIcon
                  size={25 * escalaIcone}
                  color={cores.text}
                  weight="regular"
                />
              </Pressable>

              <Texto
                tamanho={26}
                className="ml-3"
                style={{
                  color: cores.text,
                }}
              >
                Quiz
              </Texto>
            </View>

            {/* Quizzes diários */}
            <Texto
              tamanho={20}
              className="mb-3 mt-1"
              style={{
                color: cores.text,
              }}
            >
              Quizzes Diários
            </Texto>

            <View
              style={{
                overflow: "hidden",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: cores.border,
                backgroundColor: cores.surface,
              }}
            >
              {quizzesDiarios.map((quiz, index) => {
                const Icone = quiz.icone;

                return (
                  <Pressable
                    key={quiz.id}
                    onPress={() =>
                      abrirQuiz(quiz.id, quiz.titulo)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${quiz.titulo}`}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      minHeight: 48 * escalaIcone,
                      borderBottomWidth:
                        index !== quizzesDiarios.length - 1
                          ? 1
                          : 0,
                      borderBottomColor: cores.border,
                      backgroundColor: pressed
                        ? cores.surfaceSecondary
                        : "transparent",
                      opacity: pressed ? 0.8 : 1,
                      transform: [
                        {
                          scale: pressed ? 0.99 : 1,
                        },
                      ],
                    })}
                  >
                    <Icone
                      size={(quiz.destaque ? 23 : 26) * escalaIcone}
                      color={quiz.cor}
                      weight="regular"
                    />

                    <Texto
                      tamanho={14}
                      className="ml-3 flex-1 font-semibold"
                      style={{
                        color: quiz.destaque
                          ? cores.primary
                          : cores.text,
                      }}
                    >
                      {quiz.titulo}
                    </Texto>

                    <CaretRightIcon
                      size={21 * escalaIcone}
                      color={
                        quiz.destaque
                          ? "#00C853"
                          : cores.icon
                      }
                      weight="regular"
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Categorias */}
            <Texto
              tamanho={20}
              className="mb-3 mt-5"
              style={{
                color: cores.text,
              }}
            >
              Quiz - Categorias
            </Texto>

            <View
              style={{
                marginBottom: 20,
                overflow: "hidden",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: cores.border,
                backgroundColor: cores.surface,
              }}
            >
              {categorias.map((categoria, index) => {
                const Icone = categoria.icone;

                return (
                  <Pressable
                    key={categoria.id}
                    onPress={() =>
                      abrirQuiz(
                        categoria.id,
                        categoria.titulo
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${categoria.titulo}`}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      minHeight: 58 * escalaIcone,
                      borderBottomWidth:
                        index !== categorias.length - 1
                          ? 1
                          : 0,
                      borderBottomColor: cores.border,
                      backgroundColor: pressed
                        ? cores.surfaceSecondary
                        : "transparent",
                      opacity: pressed ? 0.8 : 1,
                      transform: [
                        {
                          scale: pressed ? 0.99 : 1,
                        },
                      ],
                    })}
                  >
                    <View
                      style={{
                        marginRight: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28 * escalaIcone,
                        height: 28 * escalaIcone,
                      }}
                    >
                      <Icone
                        size={23 * escalaIcone}
                        color={categoria.cor}
                        weight="fill"
                      />
                    </View>

                    <Texto
                      tamanho={14}
                      className="flex-1 font-semibold"
                      style={{
                        color: cores.text,
                      }}
                    >
                      {categoria.titulo}
                    </Texto>

                    <CaretRightIcon
                      size={20 * escalaIcone}
                      color={cores.icon}
                      weight="regular"
                    />
                  </Pressable>
                );
              })}
            </View>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default Quiz;