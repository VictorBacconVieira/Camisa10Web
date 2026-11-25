
import { useEffect, useState } from "react";

import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  XIcon,
  TrophyIcon,
  SoccerBallIcon,
  ClockIcon,
  MapPinIcon,
  BroadcastIcon,
} from "phosphor-react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Texto } from "../components/texto";
import { SideBar } from "../components/sideBar";
import { CalendarioPersonalizado } from "../components/calendarioPersonalizado";

import { useAccessibility } from "../context/AccessibilityContext";
import { useTheme } from "../context/ThemeContext";

// =====================================================
// API
// =====================================================

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// =====================================================
// STATUS DOS JOGOS
// =====================================================

const STATUS_AO_VIVO = [
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE",
  "INT",
];

const STATUS_FINALIZADO = [
  "FT",
  "AET",
  "PEN",
  "FT_PEN",
];

const STATUS_AGENDADO = [
  "NS",
  "TBD",
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function Jogos() {
  const navigation = useNavigation();

  const { width } = useWindowDimensions();

  const { cores } = useTheme();

  const {
    fontScale,
    configuracoes,
  } = useAccessibility();

  // =====================================================
  // RESPONSIVIDADE
  // =====================================================

  const telaGrande = width >= 1100;
  const telaMedia = width >= 750;

  const larguraConteudo = telaGrande ? 1200 : 950;

  // =====================================================
  // CORES
  // =====================================================

  const fundo = cores.background;
  const superficie = cores.surface;
  const superficieSecundaria = cores.surfaceSecondary;
  const borda = cores.border;
  const texto = cores.text;
  const textoSecundario = cores.textSecondary;
  const textoTerciario = cores.textTertiary;
  const primaria = cores.primary;
  const icone = cores.icon;

  // =====================================================
  // ESTADOS
  // =====================================================

  const [filtroData, setFiltroData] = useState("todos");
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const [jogos, setJogos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [atualizacao, setAtualizacao] = useState(0);

  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [pesquisa, setPesquisa] = useState("");

  // =====================================================
  // DATAS
  // =====================================================

  const hoje = new Date();

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);

  // =====================================================
  // FILTROS
  // =====================================================

  const filtrosStatus = [
    { id: "todos", nome: "Todos" },
    { id: "aoVivo", nome: "Ao vivo" },
    { id: "finalizados", nome: "Finalizados" },
    { id: "agendados", nome: "Agendados" },
  ];

  // =====================================================
  // CARREGAR JOGOS
  // =====================================================

  useEffect(() => {
    let ativo = true;

    async function carregarJogos() {
      try {
        setCarregando(true);
        setErro(null);

        const dataConsulta = new Date();

        if (filtroData === "amanha") {
          dataConsulta.setDate(dataConsulta.getDate() + 1);
        }

        if (
          filtroData === "personalizado" &&
          dataSelecionada
        ) {
          dataConsulta.setFullYear(
            dataSelecionada.getFullYear(),
            dataSelecionada.getMonth(),
            dataSelecionada.getDate()
          );
        }

        const ano = dataConsulta.getFullYear();

        const mes = String(
          dataConsulta.getMonth() + 1
        ).padStart(2, "0");

        const dia = String(
          dataConsulta.getDate()
        ).padStart(2, "0");

        const data = `${ano}-${mes}-${dia}`;

        const resposta = await fetch(
          `${API_URL}/api/jogos?data=${data}`
        );

        if (!resposta.ok) {
          throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const resultado = await resposta.json();

        if (resultado.erro) {
          throw new Error(resultado.erro);
        }

        if (ativo) {
          setJogos(
            Array.isArray(resultado.jogos)
              ? resultado.jogos
              : []
          );
        }
      } catch (e) {
        console.error("Erro ao carregar jogos:", e);

        if (ativo) {
          setErro(
            "Não foi possível carregar os jogos. Verifique sua conexão com o servidor."
          );

          setJogos([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarJogos();

    return () => {
      ativo = false;
    };
  }, [filtroData, dataSelecionada, atualizacao]);

  // =====================================================
  // FORMATAR DATA
  // =====================================================

  function formatarData(data) {
    if (!data) return "--/--";

    const dia = String(data.getDate()).padStart(2, "0");

    const mes = String(
      data.getMonth() + 1
    ).padStart(2, "0");

    return `${dia}/${mes}`;
  }

  // =====================================================
  // OBTER DATA DO JOGO
  // =====================================================

  function obterDataJogo(valor) {
    if (!valor) return null;

    if (
      typeof valor === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
      const [ano, mes, dia] = valor
        .split("-")
        .map(Number);

      return new Date(
        ano,
        mes - 1,
        dia,
        12,
        0,
        0
      );
    }

    const data = new Date(valor);

    return Number.isNaN(data.getTime())
      ? null
      : data;
  }

  // =====================================================
  // FORMATAR DATA DA API
  // =====================================================

  function formatarDataAPI(valor) {
    const data = obterDataJogo(valor);

    if (!data) return "--/--";

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone:
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
          ? undefined
          : "America/Sao_Paulo",
    });
  }

  // =====================================================
  // FORMATAR HORÁRIO
  // =====================================================

  function formatarHorarioAPI(valor) {
    const data = obterDataJogo(valor);

    if (
      !data ||
      (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
      )
    ) {
      return "--:--";
    }

    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  }

  // =====================================================
  // CALENDÁRIO
  // =====================================================

  function abrirCalendario() {
    setMostrarCalendario(true);
  }

  function confirmarData(data) {
    setDataSelecionada(data);
    setFiltroData("personalizado");
    setMostrarCalendario(false);
  }

  function cancelarCalendario() {
    setMostrarCalendario(false);
  }

  function selecionarFiltro(filtro) {
    setFiltroData(filtro);

    if (filtro !== "personalizado") {
      setDataSelecionada(null);
    }
  }

  // =====================================================
  // NORMALIZAR STATUS
  // =====================================================

  function normalizarStatus(status) {
    return String(status || "")
      .trim()
      .toUpperCase();
  }

  // =====================================================
  // NORMALIZAR PESQUISA
  // =====================================================

  function normalizarPesquisa(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // =====================================================
  // FILTRAR POR DATA
  // =====================================================

  const jogosFiltrados = jogos.filter((jogo) => {
    if (
      filtroData === "personalizado" &&
      dataSelecionada
    ) {
      return (
        formatarDataAPI(jogo.data) ===
        formatarData(dataSelecionada)
      );
    }

    return true;
  });

  // =====================================================
  // FILTRAR POR STATUS
  // =====================================================

  const jogosPorStatus = jogosFiltrados.filter(
    (jogo) => {
      const status = normalizarStatus(jogo.status);

      if (filtroStatus === "aoVivo") {
        return STATUS_AO_VIVO.includes(status);
      }

      if (filtroStatus === "finalizados") {
        return STATUS_FINALIZADO.includes(status);
      }

      if (filtroStatus === "agendados") {
        return STATUS_AGENDADO.includes(status);
      }

      return true;
    }
  );

  // =====================================================
  // FILTRAR POR PESQUISA
  // =====================================================

  const termoPesquisa = normalizarPesquisa(pesquisa);

  const jogosPesquisados = jogosPorStatus.filter(
    (jogo) => {
      if (!termoPesquisa) return true;

      const camposPesquisa = [
        jogo.pais,
        jogo.competicao,
        jogo.mandante,
        jogo.visitante,
      ];

      return camposPesquisa.some((campo) =>
        normalizarPesquisa(campo).includes(
          termoPesquisa
        )
      );
    }
  );

  // =====================================================
  // ESTILOS
  // =====================================================

  const cardStyle = {
    backgroundColor: superficie,
    borderWidth: 1,
    borderColor: borda,
    borderRadius: 16,
    overflow: "hidden",
  };

  const tituloSecao = {
    color: texto,
    fontSize: 21 * fontScale,
    fontWeight: "700",
  };

  // =====================================================
  // CARD DE MENSAGEM
  // =====================================================

  function CardMensagem({ titulo, descricao }) {
    return (
      <View
        style={{
          ...cardStyle,
          padding: 24,
          minHeight: 150,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Texto
          tamanho={15}
          style={{
            color: texto,
            textAlign: "center",
          }}
        >
          {titulo}
        </Texto>

        {descricao ? (
          <Texto
            tamanho={13}
            style={{
              color: textoSecundario,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            {descricao}
          </Texto>
        ) : null}
      </View>
    );
  }

  // =====================================================
  // FILTRO DE DATA
  // =====================================================

  function FiltroData({ id, titulo, valor }) {
    const selecionado = filtroData === id;

    return (
      <Pressable
        onPress={() => selecionarFiltro(id)}
        style={({ pressed }) => ({
          minWidth: 115,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 13,
          backgroundColor: selecionado
            ? primaria
            : superficie,
          borderWidth: selecionado ? 0 : 1,
          borderColor: borda,
          opacity: pressed ? 0.75 : 1,
          transform: [
            { scale: pressed ? 0.97 : 1 },
          ],
        })}
      >
        <Texto
          tamanho={11}
          style={{
            color: selecionado
              ? "#FFFFFF"
              : textoSecundario,
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
        >
          {titulo}
        </Texto>

        <Texto
          tamanho={14}
          style={{
            color: selecionado
              ? "#FFFFFF"
              : texto,
            fontWeight: "700",
            marginTop: 4,
          }}
        >
          {valor}
        </Texto>
      </Pressable>
  );
  }

  // =====================================================
  // CARD DA PARTIDA
  // =====================================================

  function CardJogo({ jogo }) {
    const status = normalizarStatus(jogo.status);

    const finalizado = STATUS_FINALIZADO.includes(status);
    const aoVivo = STATUS_AO_VIVO.includes(status);

    const horario = formatarHorarioAPI(jogo.data);
    const data = formatarDataAPI(jogo.data);

    const statusFormatado = finalizado
      ? "Finalizado"
      : aoVivo
        ? "Ao vivo"
        : STATUS_AGENDADO.includes(status)
          ? "Agendado"
          : jogo.status_descricao || "Agendado";

    const tamanhoEscudo = telaMedia ? 68 : 52;

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("DetalhesJogos", { jogo })
        }
        accessibilityRole="button"
        accessibilityLabel={`Partida ${jogo.mandante} contra ${jogo.visitante}. ${statusFormatado}. Abrir detalhes`}
        style={({ pressed }) => ({
          ...cardStyle,
          marginBottom: 14,
          padding: telaMedia ? 20 : 14,
          opacity: pressed ? 0.85 : 1,
          transform: [
            { scale: pressed ? 0.99 : 1 },
          ],
        })}
      >
        {/* ================================================= */}
        {/* COMPETIÇÃO */}
        {/* ================================================= */}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
              minWidth: 0,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {jogo.logo_competicao ? (
              <Image
                source={{
                  uri: jogo.logo_competicao,
                }}
                style={{
                  width: 32,
                  height: 32,
                }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: superficieSecundaria,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrophyIcon
                  size={17}
                  color={textoSecundario}
                />
              </View>
            )}

            <View
              style={{
                flex: 1,
                minWidth: 0,
                marginLeft: 10,
              }}
            >
              <Texto
                tamanho={13}
                numberOfLines={2}
                style={{
                  color: texto,
                  fontWeight: "700",
                }}
              >
                {jogo.competicao || "Competição"}
              </Texto>

              {jogo.pais ? (
                <Texto
                  tamanho={11}
                  numberOfLines={1}
                  style={{
                    color: textoSecundario,
                    marginTop: 3,
                  }}
                >
                  {jogo.pais}
                </Texto>
              ) : null}
            </View>
          </View>

          <CaretRightIcon
            size={20}
            color={textoTerciario}
            weight="bold"
          />
        </View>

        {/* ================================================= */}
        {/* DIVISOR */}
        {/* ================================================= */}

        <View
          style={{
            height: 1,
            backgroundColor: borda,
            marginTop: 17,
            marginBottom: 17,
          }}
        />

        {/* ================================================= */}
        {/* PARTIDA */}
        {/* ================================================= */}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* MANDANTE */}

          <View
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: "center",
              paddingHorizontal: 3,
            }}
          >
            {jogo.logo_mandante ? (
              <Image
                source={{
                  uri: jogo.logo_mandante,
                }}
                style={{
                  width: tamanhoEscudo,
                  height: tamanhoEscudo,
                }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: tamanhoEscudo,
                  height: tamanhoEscudo,
                  borderRadius: tamanhoEscudo / 2,
                  backgroundColor: "#FFFFFF",
                }}
              />
            )}

            <Texto
              tamanho={telaMedia ? 14 : 12}
              numberOfLines={3}
              style={{
                color: texto,
                fontWeight: "600",
                textAlign: "center",
                marginTop: 8,
                width: "100%",
                lineHeight: 19,
              }}
            >
              {jogo.mandante || "Time da casa"}
            </Texto>
          </View>

          {/* PLACAR */}

          <View
            style={{
              width: telaMedia ? 120 : 86,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 3,
            }}
          >
            {jogo.gols_mandante != null &&
            jogo.gols_visitante != null ? (
              <Texto
                tamanho={telaMedia ? 27 : 22}
                style={{
                  color: texto,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                {jogo.gols_mandante} - {jogo.gols_visitante}
              </Texto>
            ) : (
              <Texto
                tamanho={telaMedia ? 22 : 18}
                style={{
                  color: texto,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                {horario}
              </Texto>
            )}

            <Texto
              tamanho={11}
              style={{
                color: textoSecundario,
                marginTop: 5,
                textAlign: "center",
              }}
            >
              {data}
            </Texto>

            {/* STATUS */}

            <View
              style={{
                marginTop: 9,
                backgroundColor: aoVivo
                  ? primaria
                  : superficieSecundaria,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                maxWidth: "100%",
              }}
            >
              <Texto
                tamanho={10}
                numberOfLines={2}
                style={{
                  color: aoVivo
                    ? "#FFFFFF"
                    : textoSecundario,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {aoVivo ? "● " : ""}
                {statusFormatado}
              </Texto>
            </View>
          </View>

          {/* VISITANTE */}

          <View
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: "center",
              paddingHorizontal: 3,
            }}
          >
            {jogo.logo_visitante ? (
              <Image
                source={{
                  uri: jogo.logo_visitante,
                }}
                style={{
                  width: tamanhoEscudo,
                  height: tamanhoEscudo,
                }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: tamanhoEscudo,
                  height: tamanhoEscudo,
                  borderRadius: tamanhoEscudo / 2,
                  backgroundColor: "#FFFFFF",
                }}
              />
            )}

            <Texto
              tamanho={telaMedia ? 14 : 12}
              numberOfLines={3}
              style={{
                color: texto,
                fontWeight: "600",
                textAlign: "center",
                marginTop: 8,
                width: "100%",
                lineHeight: 19,
              }}
            >
              {jogo.visitante || "Time visitante"}
            </Texto>
          </View>
        </View>

        {/* ================================================= */}
        {/* ESTÁDIO */}
        {/* ================================================= */}

        {jogo.estadio ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderTopWidth: 1,
              borderTopColor: borda,
              marginTop: 16,
              paddingTop: 12,
            }}
          >
            <MapPinIcon
              size={14}
              color={textoTerciario}
            />

            <Texto
              tamanho={11}
              numberOfLines={2}
              style={{
                color: textoTerciario,
                marginLeft: 6,
                textAlign: "center",
              }}
            >
              {jogo.estadio}
            </Texto>
          </View>
        ) : null}
      </Pressable>
  );
  }

  // =====================================================
  // TÍTULO DA LISTA
  // =====================================================

  const tituloJogos =
    filtroData === "hoje"
      ? "Jogos de hoje"
      : filtroData === "amanha"
        ? "Jogos de amanhã"
        : filtroData === "personalizado"
          ? "Jogos da data selecionada"
          : "Próximos jogos";

  // =====================================================
  // TELA
  // =====================================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: fundo,
      }}
      edges={["top", "bottom"]}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: fundo,
        }}
      >
        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <SideBar />

        {/* ================================================= */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ================================================= */}

        <View
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <ScrollView
            style={{
              flex: 1,
            }}
            contentContainerStyle={{
              paddingHorizontal: telaMedia ? 28 : 16,
              paddingTop: 24,
              paddingBottom: 130,
              width: "100%",
              maxWidth: larguraConteudo,
              alignSelf: "center",
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ================================================= */}
            {/* CABEÇALHO */}
            {/* ================================================= */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 25,
              }}
            >
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => ({
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: superficie,
                  borderWidth: 1,
                  borderColor: borda,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                  opacity: pressed ? 0.65 : 1,
                  transform: [
                    { scale: pressed ? 0.92 : 1 },
                  ],
                })}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <ArrowLeftIcon
                  size={23}
                  color={icone}
                  weight="regular"
                />
              </Pressable>

              <View style={{ flex: 1 }}>
                <Texto
                  tamanho={12}
                  style={{
                    color: primaria,
                    fontWeight: "700",
                    letterSpacing: 2,
                  }}
                >
                  CENTRAL DO FUTEBOL
                </Texto>

                <Texto
                  tamanho={telaMedia ? 30 : 25}
                  style={{
                    color: texto,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  Jogos
                </Texto>

                <Texto
                  tamanho={13}
                  style={{
                    color: textoSecundario,
                    marginTop: 4,
                    lineHeight: 19,
                  }}
                >
                  Acompanhe partidas, resultados e próximos confrontos.
                </Texto>
              </View>
            </View>

            {/* ================================================= */}
            {/* PESQUISA */}
            {/* ================================================= */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: superficie,
                borderWidth: 1,
                borderColor: borda,
                borderRadius: 14,
                paddingHorizontal: 15,
                minHeight: 50,
                marginBottom: 20,
              }}
            >
              <MagnifyingGlassIcon
                size={21}
                color={textoSecundario}
              />

              <TextInput
                value={pesquisa}
                onChangeText={setPesquisa}
                placeholder="País, competição ou time..."
                placeholderTextColor={textoTerciario}
                style={{
                  flex: 1,
                  minWidth: 0,
                  marginLeft: 12,
                  color: texto,
                  fontFamily: configuracoes.textoNegrito
                    ? "AnuphanBold"
                    : "Inter",
                  fontSize: 14 * fontScale,
                  paddingVertical: 10,
                  outlineStyle: "none",
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel="Pesquisar jogos por país, competição ou time"
              />

              {pesquisa.length > 0 ? (
                <Pressable
                  onPress={() => setPesquisa("")}
                  style={({ pressed }) => ({
                    width: 35,
                    height: 35,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.6 : 1,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar pesquisa"
                >
                  <XIcon
                    size={18}
                    color={textoSecundario}
                    weight="bold"
                  />
                </Pressable>
              ) : null}
            </View>

            {/* ================================================= */}
            {/* SELETOR DE CALENDÁRIO */}
            {/* ================================================= */}

            <Pressable
              onPress={abrirCalendario}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: superficie,
                borderWidth: 1,
                borderColor: borda,
                borderRadius: 14,
                minHeight: 52,
                paddingHorizontal: 16,
                paddingVertical: 12,
                opacity: pressed ? 0.8 : 1,
                transform: [
                  { scale: pressed ? 0.98 : 1 },
                ],
              })}
              accessibilityRole="button"
              accessibilityLabel="Selecionar data dos jogos"
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <CalendarBlankIcon
                  size={21}
                  color={textoSecundario}
                />

                <Texto
                  tamanho={14}
                  style={{
                    color: texto,
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  {filtroData === "personalizado" &&
                  dataSelecionada
                    ? `Jogos em ${formatarData(
                        dataSelecionada
                      )}`
                    : "Selecionar outra data"}
                </Texto>
              </View>

              <CaretDownIcon
                size={20}
                color={textoSecundario}
              />
            </Pressable>

            {/* CALENDÁRIO */}

            <CalendarioPersonalizado
              visible={mostrarCalendario}
              initialDate={dataSelecionada || new Date()}
              onCancel={cancelarCalendario}
              onConfirm={confirmarData}
            />

            {/* ================================================= */}
            {/* FILTROS RÁPIDOS DE DATA */}
            {/* ================================================= */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 9,
                paddingBottom: 4,
              }}
              style={{
                marginTop: 18,
                marginBottom: 20,
              }}
            >
              <FiltroData
                id="todos"
                titulo="TODOS"
                valor="Jogos"
              />

              <FiltroData
                id="hoje"
                titulo="HOJE"
                valor={formatarData(hoje)}
              />

              <FiltroData
                id="amanha"
                titulo="AMANHÃ"
                valor={formatarData(amanha)}
              />

              <Pressable
                onPress={abrirCalendario}
                style={({ pressed }) => ({
                  minWidth: 115,
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 13,
                  backgroundColor:
                    filtroData === "personalizado"
                      ? primaria
                      : superficie,
                  borderWidth:
                    filtroData === "personalizado"
                      ? 0
                      : 1,
                  borderColor: borda,
                  opacity: pressed ? 0.75 : 1,
                  transform: [
                    { scale: pressed ? 0.97 : 1 },
                  ],
                })}
              >
                <Texto
                  tamanho={11}
                  style={{
                    color:
                      filtroData === "personalizado"
                        ? "#FFFFFF"
                        : textoSecundario,
                    fontWeight: "700",
                    letterSpacing: 0.5,
                  }}
                >
                  OUTRA
                </Texto>

                <Texto
                  tamanho={14}
                  style={{
                    color:
                      filtroData === "personalizado"
                        ? "#FFFFFF"
                        : texto,
                    fontWeight: "700",
                    marginTop: 4,
                  }}
                >
                  {filtroData === "personalizado" &&
                  dataSelecionada
                    ? formatarData(dataSelecionada)
                    : "DATA"}
                </Texto>
              </Pressable>
            </ScrollView>

            {/* ================================================= */}
            {/* FILTROS DE STATUS */}
            {/* ================================================= */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 8,
                paddingBottom: 4,
              }}
              style={{
                marginBottom: 25,
              }}
            >
              {filtrosStatus.map((item) => {
                const selecionado =
                  filtroStatus === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      setFiltroStatus(item.id)
                    }
                    style={({ pressed }) => ({
                      paddingHorizontal: 17,
                      paddingVertical: 11,
                      borderRadius: 12,
                      backgroundColor: selecionado
                        ? primaria
                        : superficie,
                      borderWidth: selecionado
                        ? 0
                        : 1,
                      borderColor: borda,
                      opacity: pressed ? 0.75 : 1,
                      transform: [
                        { scale: pressed ? 0.97 : 1 },
                      ],
                    })}
                  >
                    <Texto
                      tamanho={13}
                      style={{
                        color: selecionado
                          ? "#FFFFFF"
                          : textoSecundario,
                        fontWeight: selecionado
                          ? "700"
                          : "500",
                      }}
                    >
                      {item.nome}
                    </Texto>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ================================================= */}
            {/* CABEÇALHO DA LISTAGEM */}
            {/* ================================================= */}

            <View
              style={{
                marginBottom: 18,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <Texto
                  tamanho={21}
                  style={tituloSecao}
                >
                  {tituloJogos}
                </Texto>

                {!carregando && !erro ? (
                  <View
                    style={{
                      backgroundColor: superficie,
                      borderWidth: 1,
                      borderColor: borda,
                      paddingHorizontal: 11,
                      paddingVertical: 6,
                      borderRadius: 20,
                    }}
                  >
                    <Texto
                      tamanho={11}
                      style={{
                        color: textoSecundario,
                      }}
                    >
                      {jogosPesquisados.length}{" "}
                      {jogosPesquisados.length === 1
                        ? "partida"
                        : "partidas"}
                    </Texto>
                  </View>
                ) : null}
              </View>

              <Texto
                tamanho={13}
                style={{
                  color: textoSecundario,
                  marginTop: 5,
                }}
              >
                {carregando
                  ? "Buscando partidas..."
                  : filtroStatus === "aoVivo"
                    ? "Confira as partidas em andamento."
                    : filtroStatus === "finalizados"
                      ? "Confira os resultados das partidas."
                      : filtroStatus === "agendados"
                        ? "Confira os próximos confrontos."
                        : "Acompanhe o futebol ao redor do mundo."}
              </Texto>
            </View>

            {/* ================================================= */}
            {/* CARREGAMENTO */}
            {/* ================================================= */}

            {carregando ? (
              <CardMensagem
                titulo="Carregando partidas..."
                descricao="Estamos buscando os jogos para você."
              />
            ) : null}

            {/* ================================================= */}
            {/* ERRO */}
            {/* ================================================= */}

            {!carregando && erro ? (
              <View
                style={{
                  ...cardStyle,
                  padding: 24,
                  alignItems: "center",
                }}
              >
                <Texto
                  tamanho={15}
                  style={{
                    color: texto,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Não foi possível carregar os jogos.
                </Texto>

                <Texto
                  tamanho={13}
                  style={{
                    color: textoSecundario,
                    textAlign: "center",
                    marginTop: 8,
                    lineHeight: 20,
                  }}
                >
                  {erro}
                </Texto>

                <Pressable
                  onPress={() =>
                    setAtualizacao((valor) => valor + 1)
                  }
                  style={({ pressed }) => ({
                    backgroundColor: primaria,
                    paddingHorizontal: 22,
                    paddingVertical: 12,
                    borderRadius: 10,
                    marginTop: 18,
                    opacity: pressed ? 0.75 : 1,
                    transform: [
                      { scale: pressed ? 0.96 : 1 },
                    ],
                  })}
                >
                  <Texto
                    tamanho={13}
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                    }}
                  >
                    Tentar novamente
                  </Texto>
                </Pressable>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* NENHUM JOGO */}
            {/* ================================================= */}

            {!carregando &&
            !erro &&
            jogosPesquisados.length === 0 ? (
              <View
                style={{
                  ...cardStyle,
                  padding: 25,
                  minHeight: 210,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: superficieSecundaria,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SoccerBallIcon
                    size={30}
                    color={textoSecundario}
                  />
                </View>

                <Texto
                  tamanho={16}
                  style={{
                    color: texto,
                    fontWeight: "700",
                    textAlign: "center",
                    marginTop: 14,
                  }}
                >
                  Nenhum jogo encontrado
                </Texto>

                <Texto
                  tamanho={13}
                  style={{
                    color: textoSecundario,
                    textAlign: "center",
                    marginTop: 7,
                    lineHeight: 20,
                  }}
                >
                  {pesquisa.trim()
                    ? "Nenhuma partida corresponde à sua pesquisa."
                    : "Não há partidas cadastradas para esta data e situação."}
                </Texto>

                <Pressable
                  onPress={() => {
                    selecionarFiltro("todos");
                    setFiltroStatus("todos");
                    setPesquisa("");
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: primaria,
                    paddingHorizontal: 20,
                    paddingVertical: 11,
                    borderRadius: 10,
                    marginTop: 17,
                    opacity: pressed ? 0.75 : 1,
                    transform: [
                      { scale: pressed ? 0.96 : 1 },
                    ],
                  })}
                >
                  <Texto
                    tamanho={13}
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                    }}
                  >
                    Ver todos os jogos
                  </Texto>
                </Pressable>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* LISTAGEM DE PARTIDAS */}
            {/* ================================================= */}

            {!carregando &&
            !erro &&
            jogosPesquisados.length > 0 ? (
              <View>
                {jogosPesquisados.map((jogo, index) => (
                  <CardJogo
                    key={
                      jogo.id ??
                      `${jogo.mandante}-${jogo.visitante}-${index}`
                    }
                    jogo={jogo}
                  />
                ))}
              </View>
            ) : null}

            {/* ================================================= */}
            {/* RODAPÉ DA LISTAGEM */}
            {/* ================================================= */}

            {!carregando &&
            !erro &&
            jogosPesquisados.length > 0 ? (
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 16,
                }}
              >
                <Texto
                  tamanho={12}
                  style={{
                    color: textoTerciario,
                    textAlign: "center",
                  }}
                >
                  Você está acompanhando{" "}
                  {jogosPesquisados.length}{" "}
                  {jogosPesquisados.length === 1
                    ? "partida"
                    : "partidas"}
                .
                </Texto>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>

      {/* ===================================================== */}
      {/* BOTÃO FLUTUANTE CAMISA10 IA */}
      {/* ===================================================== */}

      <Pressable
        onPress={() =>
          navigation.navigate("Chatbot")
        }
        accessibilityRole="button"
        accessibilityLabel="Abrir assistente Camisa10 IA"
        style={({ pressed }) => ({
          position: "absolute",
          bottom: 25,
          right: 25,
          width: 62,
          height: 62,
          borderRadius: 31,
          backgroundColor: primaria,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: borda,
          opacity: pressed ? 0.8 : 1,
          transform: [
            { scale: pressed ? 0.92 : 1 },
          ],
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.2,
          shadowRadius: 6,
        })}
      >
        <Texto
          tamanho={23}
          style={{
            color: "#FFFFFF",
            fontWeight: "800",
          }}
        >
          AI
        </Texto>
      </Pressable>
    </SafeAreaView>
  );
}
