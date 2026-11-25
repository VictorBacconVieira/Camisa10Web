import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  Modal,
  Image,
} from "react-native";

import { useState, useEffect } from "react";

import {
  BellIcon,
  CaretRightIcon,
  SealQuestionIcon,
  EyeIcon,
  PersonArmsSpreadIcon,
  PaletteIcon,
  PencilSimpleIcon,
  SignOutIcon,
  SoccerBallIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  MedalIcon,
  ChartBarIcon,
} from "phosphor-react-native";

import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SideBar } from "../components/sideBar";
import { FotoPerfil } from "../components/fotoPerfil";
import { Texto } from "../components/texto";

import { useAuth } from "../context/AuthContext";
import {
  obterTimesDisponiveis,
  atualizarFotoPerfil,
  obterEstatisticasGamificacao,
  obterSequenciaQuiz,
} from "../services/authService";

import { useTheme } from "../context/ThemeContext";
import { useAccessibility } from "../context/AccessibilityContext";

export function Perfil() {
  const navigation = useNavigation();

  const { temaAtivo, cores, alterarTema } = useTheme();

  const { fontScale, configuracoes } = useAccessibility();

  // =========================================================
  // ESCALA DOS ÍCONES
  // =========================================================

  const escalaIcone =
    configuracoes.tamanhoTexto === "grande"
      ? 1.2
      : configuracoes.tamanhoTexto === "muitoGrande"
        ? 1.4
        : 1;

  // =========================================================
  // ESTADOS
  // =========================================================

  const [modalSucessoVisivel, setModalSucessoVisivel] =
    useState(false);

  const [pesquisaTime, setPesquisaTime] = useState("");

  const [fotoCarregando, setFotoCarregando] = useState(false);

  const {
    usuario: usuarioAutenticado,
    sair,
    atualizarDadosUsuario,
    atualizarFotoUsuario,
  } = useAuth();

  const [estatisticas, setEstatisticas] = useState(null);

  const [carregandoEstatisticas, setCarregandoEstatisticas] =
    useState(true);

  const [erroEstatisticas, setErroEstatisticas] =
    useState(null);

  const [sequenciaQuiz, setSequenciaQuiz] = useState(null);

  const [carregandoSequencia, setCarregandoSequencia] =
    useState(true);

  const [timesDisponiveis, setTimesDisponiveis] =
    useState([]);

  const [carregandoTimes, setCarregandoTimes] =
    useState(false);

  const [modalTimesVisivel, setModalTimesVisivel] =
    useState(false);

  // =========================================================
  // CORES DO TEMA
  // =========================================================

  const fundo = cores.background;
  const superficie = cores.surface;
  const superficieSecundaria = cores.surfaceSecondary;
  const borda = cores.border;
  const texto = cores.text;
  const textoSecundario = cores.textSecondary;
  const primaria = cores.primary;
  const icone = cores.icon;
  const overlay = cores.overlay;

  const corSucesso = primaria;
  const corAmarela = "#FFC107";
  const corVermelha = "#E53935";

  // =========================================================
  // ESTATÍSTICAS
  // =========================================================

  useEffect(() => {
    async function carregarEstatisticas() {
      try {
        setCarregandoEstatisticas(true);
        setErroEstatisticas(null);

        const dados = await obterEstatisticasGamificacao();

        setEstatisticas(dados);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
        setErroEstatisticas(error.message);
      } finally {
        setCarregandoEstatisticas(false);
      }
    }

    if (usuarioAutenticado) {
      carregarEstatisticas();
    }
  }, [usuarioAutenticado]);

  // =========================================================
  // SEQUÊNCIA DO QUIZ
  // =========================================================

  useEffect(() => {
    async function carregarSequencia() {
      try {
        setCarregandoSequencia(true);

        const dados = await obterSequenciaQuiz();

        setSequenciaQuiz(dados);
      } catch (error) {
        console.error("Erro ao carregar sequência:", error);
      } finally {
        setCarregandoSequencia(false);
      }
    }

    if (usuarioAutenticado) {
      carregarSequencia();

      const unsubscribe = navigation.addListener(
        "focus",
        carregarSequencia
      );

      return unsubscribe;
    }
  }, [usuarioAutenticado, navigation]);

  // =========================================================
  // FOTO DE PERFIL
  // =========================================================

  async function selecionarFoto(uri) {
    if (fotoCarregando) return;

    try {
      setFotoCarregando(true);

      const resultado = await atualizarFotoPerfil(uri);

      atualizarFotoUsuario(resultado.avatar_url);

      setModalSucessoVisivel(true);
    } catch (error) {
      console.log("Erro ao atualizar foto:", error.message);
    } finally {
      setFotoCarregando(false);
    }
  }

  // =========================================================
  // TIME FAVORITO
  // =========================================================

  async function abrirSeletorTimes() {
    try {
      setCarregandoTimes(true);

      const resultado = await obterTimesDisponiveis();

      setTimesDisponiveis(resultado.times || []);
      setModalTimesVisivel(true);
    } catch (error) {
      console.log("Erro ao carregar clubes:", error.message);
    } finally {
      setCarregandoTimes(false);
    }
  }

  async function salvarTimeFavorito(time) {
    try {
      await atualizarDadosUsuario({
        time_coracao_id: time ? String(time.id) : null,
      });

      setModalTimesVisivel(false);
      setPesquisaTime("");
    } catch (error) {
      console.log("Erro ao atualizar time favorito:", error.message);
    }
  }

  // =========================================================
  // DADOS DO USUÁRIO
  // =========================================================

  const usuario = {
    nome: usuarioAutenticado?.nome || "Usuário",

    xpTotal: estatisticas?.xp_total ?? 0,

    quizzes: estatisticas?.quizzes_concluidos ?? 0,

    sequenciaAtual: sequenciaQuiz?.sequencia_atual ?? 0,

    maiorSequencia: sequenciaQuiz?.maior_sequencia ?? 0,

    timeFavorito:
      usuarioAutenticado?.time_coracao?.nome || "Nenhum",

    notificacoes: "Ativadas",

    acessibilidade: "Configurar",

    tema: temaAtivo === "dark" ? "Escuro" : "Claro",

    respostasCorretas: estatisticas?.acertos ?? 0,

    escalacoesCorretas: null,
  };

  // =========================================================
  // XP E NÍVEL
  // =========================================================

  const xpTotal = Math.max(
    0,
    Number(usuario.xpTotal) || 0
  );

  const nivelAtual = estatisticas?.nivel ?? 1;

  const xpInicioNivel = estatisticas?.xp_inicio_nivel ?? 0;

  const xpProximoNivel = estatisticas?.xp_proximo_nivel ?? 10000;

  const xpAtualNivel = estatisticas?.xp_atual_nivel ?? 0;

  const xpNecessarioNivel =
    estatisticas?.xp_necessario_nivel ?? 10000;

  const progressoNivel = Math.min(
    100,
    Math.max(0, Number(estatisticas?.progresso_nivel) || 0)
  );

  const xpRestante = Math.max(
    0,
    Number(xpProximoNivel) - xpTotal
  );

  // =========================================================
  // CONQUISTAS
  // =========================================================

  const conquistas = [
    {
      id: "sabio",
      nome: "Sábio",
      descricao: "Acertou 100 perguntas",
      progresso: Math.max(
        0,
        Number(usuario.respostasCorretas) || 0
      ),
      requisito: 100,
      Icone: SealQuestionIcon,
    },
    {
      id: "olheiro",
      nome: "Olheiro",
      descricao: "Acertou 10 escalações",
      progresso: usuario.escalacoesCorretas,
      requisito: 10,
      Icone: EyeIcon,
    },
    {
      id: "campeao",
      nome: "Campeão",
      descricao: "Concluiu 50 quizzes",
      progresso: Math.max(
        0,
        Number(usuario.quizzes) || 0
      ),
      requisito: 50,
      Icone: TrophyIcon,
    },
    {
      id: "em-chamas",
      nome: "Em Chamas",
      descricao: "Sequência de 15 dias",
      progresso: Math.max(
        0,
        Number(usuario.maiorSequencia) || 0
      ),
      requisito: 15,
      Icone: FireIcon,
    },
  ].map((conquista) => ({
    ...conquista,
    desbloqueada:
      conquista.progresso !== null &&
      conquista.progresso >= conquista.requisito,
  }));

  const conquistasDesbloqueadas = conquistas.filter(
    (item) => item.desbloqueada
  ).length;

  // =========================================================
  // LISTA DE TIMES FILTRADA
  // =========================================================

  const timesFiltrados = timesDisponiveis.filter((time) =>
    time.nome
      ?.toLowerCase()
      .includes(pesquisaTime.toLowerCase().trim())
  );

  // =========================================================
  // COMPONENTE: CARD DE ESTATÍSTICA
  // =========================================================

  function CardEstatistica({
    Icon,
    valor,
    titulo,
    cor,
  }) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: superficie,
          borderWidth: 1,
          borderColor: borda,
          borderRadius: 16,
          paddingVertical: 18,
          paddingHorizontal: 8,
          alignItems: "center",
          minWidth: 0,
        }}
      >
        <Icon
          size={25 * escalaIcone}
          color={cor}
          weight="fill"
        />

        <Texto
          tamanho={18}
          style={{
            color: texto,
            fontWeight: "800",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {valor}
        </Texto>

        <Texto
          tamanho={11}
          style={{
            color: textoSecundario,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          {titulo}
        </Texto>
      </View>
    );
  }

  // =========================================================
  // COMPONENTE: TÍTULO DE SEÇÃO
  // =========================================================

  function TituloSecao({ titulo, descricao, direita }) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1 }}>
          <Texto
            tamanho={19}
            style={{
              color: texto,
              fontWeight: "800",
            }}
          >
            {titulo}
          </Texto>

          {descricao && (
            <Texto
              tamanho={12}
              style={{
                color: textoSecundario,
                marginTop: 3,
              }}
            >
              {descricao}
            </Texto>
          )}
        </View>

        {direita}
      </View>
    );
  }

  // =========================================================
  // COMPONENTE: ITEM DE CONFIGURAÇÃO
  // =========================================================

  function ItemConfiguracao({
    Icon,
    titulo,
    descricao,
    valor,
    onPress,
    ultimo = false,
  }) {
    return (
      <>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            minHeight: 66,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 15,
            paddingVertical: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: superficieSecundaria,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              size={22 * escalaIcone}
              color={icone}
              weight="regular"
            />
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Texto
              tamanho={14}
              style={{
                color: texto,
                fontWeight: "600",
              }}
            >
              {titulo}
            </Texto>

            {descricao && (
              <Texto
                tamanho={11}
                style={{
                  color: textoSecundario,
                  marginTop: 3,
                }}
              >
                {descricao}
              </Texto>
            )}
          </View>

          {valor ? (
            <Texto
              tamanho={11}
              style={{
                color: textoSecundario,
                marginRight: 6,
                maxWidth: 100,
                textAlign: "right",
              }}
            >
              {valor}
            </Texto>
          ) : null}

          <CaretRightIcon
            size={19 * escalaIcone}
            color={textoSecundario}
          />
        </Pressable>

        {!ultimo && (
          <View
            style={{
              height: 1,
              backgroundColor: borda,
              marginLeft: 67,
            }}
          />
        )}
      </>
    );
  }

  // =========================================================
  // COMPONENTE: CONQUISTA
  // =========================================================

  function CardConquista({ conquista }) {
    const Icone = conquista.Icone;

    const progresso = conquista.progresso;

    const progressoValido =
      progresso !== null && progresso !== undefined;

    const percentual = progressoValido
      ? Math.min(
          100,
          Math.max(
            0,
            (progresso / conquista.requisito) * 100
          )
        )
      : 0;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: superficie,
          borderWidth: 1,
          borderColor: conquista.desbloqueada
            ? primaria
            : borda,
          borderRadius: 15,
          padding: 13,
          marginBottom: 10,
          opacity: conquista.desbloqueada ? 1 : 0.85,
        }}
      >
        {/* ÍCONE */}

        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: superficieSecundaria,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icone
            size={25 * escalaIcone}
            color={
              conquista.desbloqueada
                ? primaria
                : textoSecundario
            }
            weight="fill"
          />
        </View>

        {/* INFORMAÇÕES */}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Texto
              tamanho={14}
              style={{
                color: texto,
                fontWeight: "700",
              }}
            >
              {conquista.nome}
            </Texto>

            {conquista.desbloqueada && (
              <CheckCircleIcon
                size={20 * escalaIcone}
                color={primaria}
                weight="fill"
              />
            )}
          </View>

          <Texto
            tamanho={11}
            style={{
              color: textoSecundario,
              marginTop: 3,
            }}
          >
            {conquista.descricao}
          </Texto>

          {/* PROGRESSO */}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              marginBottom: 5,
            }}
          >
            <Texto
              tamanho={10}
              style={{
                color: primaria,
                fontWeight: "700",
              }}
            >
              {progressoValido
                ? `${progresso.toLocaleString("pt-BR")} / ${conquista.requisito}`
                : "Em breve"}
            </Texto>
          </View>

          {progressoValido && (
            <View
              style={{
                height: 9,
                backgroundColor: borda,
                borderRadius: 20,
                overflow: "hidden",
                marginTop: 2,
              }}
            >
              <View
                style={{
                  width: `${percentual}%`,
                  height: "100%",
                backgroundColor: primaria,
                borderRadius: 20,
              }}
              />
            </View>
          )}
        </View>
      </View>
    );
  }

  // =========================================================
  // COMPONENTE: ITEM DE CLUBE
  // =========================================================

  function ItemTime({ time }) {
    const selecionado =
      String(usuarioAutenticado?.time_coracao?.id) ===
      String(time.id);

    return (
      <Pressable
        onPress={() => salvarTimeFavorito(time)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: superficie,
          borderWidth: 1,
          borderColor: selecionado ? primaria : borda,
          borderRadius: 13,
          padding: 12,
          marginBottom: 9,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {time.logo ? (
          <Image
            source={{ uri: time.logo }}
            style={{
              width: 42,
              height: 42,
            }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 50,
              backgroundColor: superficieSecundaria,
            }}
          />
        )}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Texto
            tamanho={14}
            style={{
              color: texto,
              fontWeight: "700",
            }}
          >
            {time.nome}
          </Texto>

          <Texto
            tamanho={10}
            style={{
              color: textoSecundario,
              marginTop: 3,
            }}
          >
            {time.pais || "País não informado"}
          </Texto>

          {time.competicoes?.length > 0 && (
            <Texto
              tamanho={10}
              style={{
                color: textoSecundario,
                marginTop: 3,
              }}
            >
              {time.competicoes
                .map((competicao) =>
                  typeof competicao === "string"
                    ? competicao
                    : competicao.name
                )
                .filter(Boolean)
                .join(" • ")}
            </Texto>
          )}
        </View>

        {selecionado && (
          <CheckCircleIcon
            size={22}
            color={primaria}
            weight="fill"
          />
        )}
      </Pressable>
    );
  }

// =========================================================
// COMPONENTE: MODAL DE SELEÇÃO DE TIME
// =========================================================

function ModalTimes() {
  return (
    <Modal
      visible={modalTimesVisivel}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={() => {
        setModalTimesVisivel(false);
        setPesquisaTime("");
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.65)",
        }}
      >
        {/* CONTAINER DO MODAL */}

        <View
          style={{
            height: "85%",
            backgroundColor: fundo,
            borderWidth: 1,
            borderColor: borda,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 15,
            overflow: "hidden",
          }}
        >
          {/* CABEÇALHO */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <View style={{ flex: 1 }}>
              <Texto
                tamanho={20}
                style={{
                  color: texto,
                  fontWeight: "800",
                }}
              >
                Meu Time Favorito
              </Texto>

              <Texto
                tamanho={12}
                style={{
                  color: textoSecundario,
                  marginTop: 3,
                }}
              >
                Escolha o clube que representa você
              </Texto>
            </View>

            <Pressable
              onPress={() => {
                setModalTimesVisivel(false);
                setPesquisaTime("");
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: superficieSecundaria,
              }}
            >
              <Texto
                tamanho={12}
                style={{
                  color: primaria,
                  fontWeight: "700",
                }}
              >
                Fechar
              </Texto>
            </Pressable>
          </View>

          {/* PESQUISA */}

          <TextInput
            value={pesquisaTime}
            onChangeText={setPesquisaTime}
            placeholder="Pesquisar clube..."
            placeholderTextColor={textoSecundario}
            style={{
              marginBottom: 12,
              borderWidth: 1,
              borderColor: borda,
              backgroundColor: superficie,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: texto,
              fontFamily: "Inter",
              fontSize: 14 * fontScale,
            }}
          />

          {/* REMOVER FAVORITO */}

          <Pressable
            onPress={() => salvarTimeFavorito(null)}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: corVermelha,
              borderRadius: 12,
              paddingVertical: 12,
              marginBottom: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Texto
              tamanho={13}
              style={{
                textAlign: "center",
                color: corVermelha,
                fontWeight: "600",
              }}
            >
              Remover time favorito
            </Texto>
          </Pressable>

          {/* LISTA DE TIMES */}

          <View style={{ flex: 1 }}>
            {carregandoTimes ? (
              <View
                style={{
                  flex: 1,
                  paddingVertical: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Texto
                  tamanho={14}
                  style={{
                    color: textoSecundario,
                  }}
                >
                  Carregando clubes...
                </Texto>
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {timesFiltrados.map((time) => (
                  <ItemTime
                    key={time.id}
                    time={time}
                  />
                ))}

                {timesFiltrados.length === 0 && (
                  <Texto
                    tamanho={14}
                    style={{
                      color: textoSecundario,
                      textAlign: "center",
                      marginTop: 25,
                    }}
                  >
                    Nenhum clube encontrado.
                  </Texto>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

  // =========================================================
  // COMPONENTE: MODAL DE FOTO ATUALIZADA
  // =========================================================

  function ModalSucessoFoto() {
    return (
      <Modal
        visible={modalSucessoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSucessoVisivel(false)}
      >
        <Pressable
          onPress={() => setModalSucessoVisivel(false)}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.65)",
            paddingHorizontal: 24,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              alignItems: "center",
              backgroundColor: superficie,
              borderWidth: 1,
              borderColor: borda,
              borderRadius: 22,
              paddingHorizontal: 24,
              paddingVertical: 28,
            }}
          >
            <CheckCircleIcon
              size={50 * escalaIcone}
              color={corSucesso}
              weight="fill"
            />

            <Texto
              tamanho={17}
              style={{
                color: texto,
                fontWeight: "700",
                marginTop: 14,
                textAlign: "center",
              }}
            >
              Foto de perfil atualizada!
            </Texto>

            <Texto
              tamanho={12}
              style={{
                color: textoSecundario,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Sua nova foto já está sendo exibida no perfil.
            </Texto>

            <Pressable
              onPress={() => setModalSucessoVisivel(false)}
              style={({ pressed }) => ({
                marginTop: 22,
                width: "100%",
                alignItems: "center",
                backgroundColor: primaria,
                borderRadius: 12,
                paddingVertical: 13,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Texto
                tamanho={14}
                style={{
                  color: "#FFFFFF",
                  fontWeight: "800",
                }}
              >
                Continuar
              </Texto>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  // =========================================================
  // TELA
  // =========================================================

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: fundo }}
      edges={["top", "bottom"]}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
        }}
      >
        {/* SIDEBAR */}
        <SideBar />

        {/* CONTEÚDO DO PERFIL */}
        <ScrollView
          className="flex-1"
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            maxWidth: 850,
            width: "100%",
            alignSelf: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
        {/* ================================================= */}
        {/* CABEÇALHO */}
        {/* ================================================= */}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 18,
            paddingBottom: 20,
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 13,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: superficie,
              borderWidth: 1,
              borderColor: borda,
              opacity: pressed ? 0.65 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <ArrowLeftIcon
              size={23 * escalaIcone}
              color={icone}
            />
          </Pressable>

          <View style={{ marginLeft: 13 }}>
            <Texto
              tamanho={25}
              style={{
                color: texto,
                fontWeight: "800",
              }}
            >
              Meu Perfil
            </Texto>

            <Texto
              tamanho={12}
              style={{ color: textoSecundario }}
            >
              Sua jornada no Camisa10
            </Texto>
          </View>
        </View>

        {/* ================================================= */}
        {/* CARD PRINCIPAL DO JOGADOR */}
        {/* ================================================= */}

        <View
          style={{
            backgroundColor: superficie,
            borderWidth: 1,
            borderColor: borda,
            borderRadius: 22,
            padding: 20,
            overflow: "hidden",
          }}
        >
          {/* IDENTIDADE */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <FotoPerfil
              foto={usuarioAutenticado?.avatar_url || null}
              nome={usuario.nome}
              tamanho={90}
              onFotoSelecionada={selecionarFoto}
            />

            <View style={{ flex: 1, marginLeft: 15 }}>
              <Texto
                tamanho={20}
                style={{
                  color: texto,
                  fontWeight: "800",
                }}
              >
                {usuario.nome}
              </Texto>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  marginTop: 8,
                  backgroundColor: superficieSecundaria,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <StarIcon
                  size={15}
                  color={corAmarela}
                  weight="fill"
                />

                <Texto
                  tamanho={11}
                  style={{
                    color: texto,
                    marginLeft: 5,
                    fontWeight: "700",
                  }}
                >
                  Nível {nivelAtual}
                </Texto>
              </View>

              {fotoCarregando && (
                <Texto
                  tamanho={10}
                  style={{
                    color: textoSecundario,
                    marginTop: 5,
                  }}
                >
                  Atualizando foto...
                </Texto>
              )}
            </View>

            {/* EDITAR PERFIL */}

            <Pressable
              onPress={() => navigation.navigate("EditarPerfil")}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: superficieSecundaria,
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <PencilSimpleIcon
                size={20}
                color={icone}
              />
            </Pressable>
          </View>

          {/* XP */}

          <View style={{ marginTop: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Texto
                tamanho={12}
                style={{
                  color: textoSecundario,
                  fontWeight: "700",
                }}
              >
                PROGRESSO DO NÍVEL
              </Texto>

              <Texto
                tamanho={12}
                style={{
                  color: primaria,
                  fontWeight: "800",
                }}
              >
                {xpAtualNivel.toLocaleString("pt-BR")} /{" "}
                {xpNecessarioNivel.toLocaleString("pt-BR")} XP
              </Texto>
            </View>

            <View
              style={{
                height: 9,
                backgroundColor: borda,
                borderRadius: 20,
                marginTop: 10,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progressoNivel}%`,
                  height: "100%",
                  backgroundColor: primaria,
                  borderRadius: 20,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 9,
              }}
            >
              <Texto
                tamanho={11}
                style={{ color: textoSecundario }}
              >
                {xpTotal.toLocaleString("pt-BR")} XP acumulados
              </Texto>

              <Texto
                tamanho={11}
                style={{ color: textoSecundario }}
              >
                {carregandoEstatisticas
                  ? "Calculando..."
                  : erroEstatisticas
                    ? "Estatísticas indisponíveis"
                    : `${xpRestante.toLocaleString("pt-BR")} XP restantes`}
              </Texto>
            </View>
          </View>
        </View>

        {/* ================================================= */}
        {/* ESTATÍSTICAS */}
        {/* ================================================= */}

        <View style={{ marginTop: 24 }}>
          <TituloSecao
            titulo="Minha jornada"
            descricao="Seu desempenho dentro do Camisa10"
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <CardEstatistica
              Icon={TrophyIcon}
              valor={Number(usuario.quizzes).toLocaleString("pt-BR")}
              titulo="Quizzes"
              cor={primaria}
            />

            <CardEstatistica
              Icon={StarIcon}
              valor={xpTotal.toLocaleString("pt-BR")}
              titulo="XP Total"
              cor={corAmarela}
            />

            <CardEstatistica
              Icon={FireIcon}
              valor={
                carregandoSequencia
                  ? "..."
                  : Number(usuario.sequenciaAtual).toLocaleString("pt-BR")
              }
              titulo="Dias seguidos"
              cor={corVermelha}
            />
          </View>
        </View>

        {/* ================================================= */}
        {/* CONQUISTAS */}
        {/* ================================================= */}

        <View style={{ marginTop: 28 }}>
          <TituloSecao
            titulo="Conquistas"
            descricao="Desbloqueie objetivos e mostre sua habilidade"
            direita={
              <View
                style={{
                  backgroundColor: superficieSecundaria,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Texto
                  tamanho={11}
                  style={{
                    color: primaria,
                    fontWeight: "800",
                  }}
                >
                  {conquistasDesbloqueadas} / {conquistas.length}
                </Texto>
              </View>
            }
          />

          {conquistas.map((conquista) => (
            <CardConquista
              key={conquista.id}
              conquista={conquista}
            />
          ))}
        </View>

        {/* ================================================= */}
        {/* CONFIGURAÇÕES */}
        {/* ================================================= */}

        <View style={{ marginTop: 28 }}>
          <TituloSecao
            titulo="Preferências"
            descricao="Personalize sua experiência"
          />

          <View
            style={{
              backgroundColor: superficie,
              borderWidth: 1,
              borderColor: borda,
              borderRadius: 17,
              overflow: "hidden",
            }}
          >
            {/* EDITAR PERFIL */}

            <ItemConfiguracao
              Icon={PencilSimpleIcon}
              titulo="Editar perfil"
              descricao="Nome, dados pessoais e senha"
              onPress={() => navigation.navigate("EditarPerfil")}
            />

            {/* TIME FAVORITO */}

            <ItemConfiguracao
              Icon={SoccerBallIcon}
              titulo="Meu time favorito"
              descricao="Personalize seu conteúdo de futebol"
              valor={usuario.timeFavorito}
              onPress={abrirSeletorTimes}
            />

            {/* NOTIFICAÇÕES */}

            <ItemConfiguracao
              Icon={BellIcon}
              titulo="Notificações"
              descricao="Alertas e novidades"
              valor={usuario.notificacoes}
              onPress={() => {
                // FUTURO:
                // Configuração de notificações.
              }}
            />

            {/* ACESSIBILIDADE */}

            <ItemConfiguracao
              Icon={PersonArmsSpreadIcon}
              titulo="Acessibilidade"
              descricao="Texto, contraste e visualização"
              onPress={() => navigation.navigate("Acessibilidade")}
            />

            {/* TEMA */}

            <Pressable
              onPress={() =>
                alterarTema(
                  temaAtivo === "dark" ? "light" : "dark"
                )
              }
              style={({ pressed }) => ({
                minHeight: 72,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 15,
                paddingVertical: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: superficieSecundaria,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PaletteIcon
                  size={22 * escalaIcone}
                  color={icone}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Texto
                  tamanho={14}
                  style={{
                    color: texto,
                    fontWeight: "600",
                  }}
                >
                  Aparência
                </Texto>

                <Texto
                  tamanho={11}
                  style={{
                    color: textoSecundario,
                    marginTop: 3,
                  }}
                >
                  Alternar tema claro e escuro
                </Texto>
              </View>

              <Texto
                tamanho={11}
                style={{
                  color: textoSecundario,
                  marginRight: 10,
                }}
              >
                {temaAtivo === "dark" ? "Escuro" : "Claro"}
              </Texto>

              {/* SWITCH VISUAL */}

              <View
                style={{
                  width: 43,
                  height: 24,
                  borderRadius: 20,
                  justifyContent: "center",
                  paddingHorizontal: 3,
                  backgroundColor:
                    temaAtivo === "dark"
                      ? primaria
                      : borda,
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 20,
                    backgroundColor: "#FFFFFF",
                    alignSelf:
                      temaAtivo === "dark"
                        ? "flex-end"
                        : "flex-start",
                  }}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* ================================================= */}
        {/* SAIR DA CONTA */}
        {/* ================================================= */}

        <View style={{ marginTop: 26 }}>
          <Pressable
            onPress={async () => {
              try {
                await sair();

                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              } catch (error) {
                console.log(
                  "Erro ao sair da conta:",
                  error.message
                );
              }
            }}
            style={({ pressed }) => ({
              minHeight: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: superficie,
              borderWidth: 1,
              borderColor: corVermelha,
              borderRadius: 15,
              paddingHorizontal: 16,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Texto
              tamanho={14}
              style={{
                color: corVermelha,
                fontWeight: "700",
              }}
            >
              Sair da conta
            </Texto>

            <SignOutIcon
              size={23 * escalaIcone}
              color={corVermelha}
            />
          </Pressable>
        </View>

        {/* ================================================= */}
        {/* RODAPÉ */}
        {/* ================================================= */}

        <View
          style={{
            alignItems: "center",
            marginTop: 25,
          }}
        >
          <Texto
            tamanho={10}
            style={{
              color: textoSecundario,
              textAlign: "center",
            }}
          >
            Camisa10 • Futebol em um só lugar
          </Texto>
        </View>
            </ScrollView>
    </View>

    {/* MODAIS */}
    <ModalTimes />

    <ModalSucessoFoto />
  </SafeAreaView>
);
  
}