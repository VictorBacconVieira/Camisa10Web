
import { useEffect, useState } from "react";

import {
  Pressable,
  ScrollView,
  View,
  Text,
  Image,
  Linking,
  Modal,
  Switch,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import {
  PersonArmsSpreadIcon,
  CaretRightIcon,
  QuestionIcon,
} from "phosphor-react-native";

import { Texto } from "../components/texto";
import { SideBar } from "../components/sideBar";

import {
  obterPlacarPersonalizado,
  obterNoticias,
} from "../services/authService";

import { useTheme } from "../context/ThemeContext";
import { useAccessibility } from "../context/AccessibilityContext";

export function Home() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const {
    cores,
    altoContraste,
    alternarAltoContraste,
  } = useTheme();

  const {
    configuracoes,
    alterarTamanhoTexto,
    alternarAcessibilidade,
  } = useAccessibility();

  // =====================================================
  // ESTADOS
  // =====================================================

  const [placar, setPlacar] = useState(null);
  const [carregandoPlacar, setCarregandoPlacar] = useState(true);
  const [erroPlacar, setErroPlacar] = useState(null);

  const [noticias, setNoticias] = useState([]);
  const [carregandoNoticias, setCarregandoNoticias] = useState(true);
  const [erroNoticias, setErroNoticias] = useState(null);

  const [modalAcessibilidade, setModalAcessibilidade] = useState(false);

  // =====================================================
  // CORES
  // =====================================================

  const fundo = cores.background;
  const superficie = cores.surface;
  const superficieSecundaria = cores.surfaceSecondary;
  const borda = cores.border;
  const texto = cores.text;
  const textoSecundario = cores.textSecondary;
  const primaria = cores.primary;
  const icone = cores.icon;
  const overlay = cores.overlay;

  // =====================================================
  // RESPONSIVIDADE
  // =====================================================

  const telaGrande = width >= 1100;
  const telaMedia = width >= 750;

  const larguraConteudo = telaGrande ? 1200 : 850;

  const escalaEscudo =
    configuracoes.tamanhoTexto === "grande"
      ? 1.15
      : configuracoes.tamanhoTexto === "muitoGrande"
      ? 1.3
      : 1;

  // =====================================================
  // CARREGAR PLACAR
  // =====================================================

  useEffect(() => {
    async function carregarPlacar() {
      try {
        setCarregandoPlacar(true);
        setErroPlacar(null);

        const resultado = await obterPlacarPersonalizado();

        setPlacar(resultado);
      } catch (error) {
        console.log("Erro ao carregar placar:", error.message);
        setErroPlacar(error.message);
      } finally {
        setCarregandoPlacar(false);
      }
    }

    carregarPlacar();
  }, []);

  // =====================================================
  // CARREGAR NOTÍCIAS
  // =====================================================

  useEffect(() => {
    async function carregarNoticias() {
      try {
        setCarregandoNoticias(true);
        setErroNoticias(null);

        const resultado = await obterNoticias("todas");

        setNoticias(resultado?.noticias || []);
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);

        setErroNoticias(error.message);
        setNoticias([]);
      } finally {
        setCarregandoNoticias(false);
      }
    }

    carregarNoticias();
  }, []);

  // =====================================================
  // DADOS DO JOGO
  // =====================================================

  const timeFavorito = placar?.time ?? null;
  const jogoDestaque = placar?.jogo?.jogo ?? null;
  const tipoJogo = placar?.jogo?.tipo ?? null;

  const ehResultado = tipoJogo === "resultado";

  const dataFormatada = jogoDestaque?.data
    ? new Date(jogoDestaque.data).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        timeZone: "America/Sao_Paulo",
      })
    : null;

  const horarioFormatado = jogoDestaque?.data
    ? new Date(jogoDestaque.data).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      })
    : null;

  // =====================================================
  // FORMATAR TEMPO DAS NOTÍCIAS
  // =====================================================

  function formatarTempo(data) {
    if (!data) return "";

    const agora = new Date();
    const publicacao = new Date(data);

    const diferenca = Math.floor(
      (agora - publicacao) / 60000
    );

    if (diferenca < 1) return "Agora";

    if (diferenca < 60) {
      return `Há ${diferenca} min`;
    }

    const horas = Math.floor(diferenca / 60);

    if (horas < 24) {
      return `Há ${horas}h`;
    }

    const dias = Math.floor(horas / 24);

    return `Há ${dias} dia${dias > 1 ? "s" : ""}`;
  }

  // =====================================================
  // ABRIR NOTÍCIA
  // =====================================================

  async function abrirNoticia(noticia) {
    if (!noticia?.url) return;

    try {
      await Linking.openURL(noticia.url);
    } catch (error) {
      console.error("Erro ao abrir notícia:", error);
    }
  }

  // =====================================================
  // ESTILOS
  // =====================================================

  const cardStyle = {
    backgroundColor: superficie,
    borderWidth: 1,
    borderColor: borda,
    borderRadius: 16,
  };

  const tituloSecao = {
    color: texto,
    fontSize: 21,
    fontWeight: "700",
  };

  const textoSecao = {
    color: textoSecundario,
    fontSize: 14,
  };

  // =====================================================
  // CARD DE ESTADO
  // =====================================================

  function CardMensagem({ titulo, descricao }) {
    return (
      <View
        style={{
          ...cardStyle,
          padding: 25,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 140,
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
            }}
          >
            {descricao}
          </Texto>
        ) : null}
      </View>
    );
  }

  // =====================================================
  // CARD DE NOTÍCIA
  // =====================================================

  function CardNoticia({ noticia, index }) {
    return (
      <Pressable
        key={`${noticia.url || noticia.titulo}-${index}`}
        onPress={() => abrirNoticia(noticia)}
        style={({ pressed }) => ({
          flex: telaMedia ? 1 : undefined,
          width: telaMedia ? undefined : "100%",
          minWidth: telaMedia ? 280 : undefined,
          maxWidth: telaGrande ? 390 : undefined,
          backgroundColor: superficie,
          borderWidth: 1,
          borderColor: borda,
          borderRadius: 16,
          overflow: "hidden",
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        {/* IMAGEM */}

        {noticia.imagem ? (
          <Image
            source={{ uri: noticia.imagem }}
            style={{
              width: "100%",
              height: telaGrande ? 190 : 160,
              backgroundColor: superficieSecundaria,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 160,
              backgroundColor: superficieSecundaria,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Texto tamanho={13} style={{ color: textoSecundario }}>
              Imagem indisponível
            </Texto>
          </View>
        )}

        {/* INFORMAÇÕES */}

        <View style={{ padding: 16, flex: 1 }}>
          <Texto
            tamanho={15}
            style={{
              color: texto,
              fontWeight: "600",
              lineHeight: 22,
            }}
          >
            {noticia.titulo || "Notícia sem título"}
          </Texto>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: 14,
              gap: 5,
            }}
          >
            {noticia.url ? (
              <Image
                source={{
                  uri: `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
                    noticia.url
                  )}&sz=64`,
                }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                }}
                resizeMode="contain"
              />
            ) : null}

            <Texto
              tamanho={11}
              style={{
                color: textoSecundario,
              }}
            >
              {noticia.fonte || "Fonte"}
            </Texto>

            <Text style={{ color: textoSecundario, fontSize: 11 }}>
              •
            </Text>

            <Texto
              tamanho={11}
              style={{
                color: textoSecundario,
              }}
            >
              {formatarTempo(noticia.publicado_em)}
            </Texto>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Texto
              tamanho={12}
              style={{
                color: primaria,
                fontWeight: "600",
              }}
            >
              Ler notícia
            </Texto>

            <CaretRightIcon
              size={16}
              color={primaria}
              weight="bold"
            />
          </View>
        </View>
      </Pressable>
    );
  }

  // =====================================================
  // COMPONENTE PRINCIPAL
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
        {/* SIDEBAR */}

        <SideBar />

        {/* CONTEÚDO */}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: telaMedia ? 28 : 16,
            paddingTop: 20,
            paddingBottom: 120,
            width: "100%",
            maxWidth: larguraConteudo,
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
              justifyContent: "space-between",
              marginBottom: 28,
              gap: 15,
            }}
          >
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
                tamanho={telaMedia ? 32 : 26}
                style={{
                  color: texto,
                  fontWeight: "700",
                  marginTop: 5,
                }}
              >
                Bem-vindo à Camisa10
              </Texto>

              <Texto
                tamanho={14}
                style={{
                  color: textoSecundario,
                  marginTop: 5,
                }}
              >
                Acompanhe seu time, notícias e desafios.
              </Texto>
            </View>

            {/* ACESSIBILIDADE */}

            <Pressable
              onPress={() => setModalAcessibilidade(true)}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: superficie,
                borderWidth: 1,
                borderColor: borda,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <PersonArmsSpreadIcon
                size={27}
                color={icone}
                weight="regular"
              />
            </Pressable>
          </View>

          {/* ================================================= */}
          {/* CENTRAL DE JOGOS */}
          {/* ================================================= */}

          <View style={{ marginBottom: 30 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
                gap: 10,
              }}
            >
              <Texto tamanho={21} style={tituloSecao}>
                Central de jogos
              </Texto>

              <Pressable
                onPress={() => navigation.navigate("Jogos")}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Texto tamanho={13} style={{ color: textoSecundario }}>
                  Ver todos
                </Texto>

                <CaretRightIcon
                  size={18}
                  color={textoSecundario}
                />
              </Pressable>
            </View>

            {/* ESTADOS DA API */}

            {carregandoPlacar ? (
              <CardMensagem
                titulo="Carregando informações do seu time..."
 
              />
            ) : erroPlacar ? (
              <CardMensagem
                titulo="Não foi possível carregar as informações do seu time."
                descricao="Verifique sua conexão e tente novamente mais tarde."
              />
            ) : !timeFavorito ? (
              <CardMensagem
                titulo="Você ainda não escolheu seu time do coração."
                descricao="Acesse seu perfil e escolha um time para acompanhar os jogos!"
              />
            ) : !jogoDestaque ? (
              <CardMensagem
                titulo="Nenhuma partida disponível no momento"
                descricao="Estamos buscando os próximos jogos do seu time. Volte mais tarde!"
              />
            ) : (
              /* CARD DE JOGO */

              <Pressable
                onPress={() => navigation.navigate("Jogos")}
                style={({ pressed }) => ({
                  ...cardStyle,
                  padding: telaMedia ? 24 : 16,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                })}
              >
                {/* COMPETIÇÃO */}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  {jogoDestaque.logo_competicao ? (
                    <Image
                      source={{
                        uri: jogoDestaque.logo_competicao,
                      }}
                      style={{
                        width: 35 * escalaEscudo,
                        height: 35 * escalaEscudo,
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: 8,
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  )}

                  <View style={{ marginLeft: 12 }}>
                    <Texto
                      tamanho={13}
                      style={{
                        color: textoSecundario,
                      }}
                    >
                      COMPETIÇÃO
                    </Texto>

                    <Texto
                      tamanho={15}
                      style={{
                        color: texto,
                        fontWeight: "600",
                      }}
                    >
                      {jogoDestaque.competicao || "Partida em destaque"}
                    </Texto>
                  </View>
                </View>

                {/* TIMES E PLACAR */}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* MANDANTE */}

                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    {jogoDestaque.escudo_mandante ? (
                      <Image
                        source={{
                          uri: jogoDestaque.escudo_mandante,
                        }}
                        style={{
                          width: 90 * escalaEscudo,
                          height: 90 * escalaEscudo,
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 45,
                          backgroundColor: "#FFFFFF",
                        }}
                      />
                    )}

                    <Texto
                      tamanho={14}
                      style={{
                        color: texto,
                        textAlign: "center",
                        marginTop: 10,
                        fontWeight: "600",
                      }}
                    >
                      {jogoDestaque.mandante || "Mandante"}
                    </Texto>
                  </View>

                  {/* PLACAR */}

                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 100,
                    }}
                  >
                    <Texto
                      tamanho={telaMedia ? 42 : 34}
                      style={{
                        color: texto,
                        fontWeight: "700",
                      }}
                    >
                      {ehResultado &&
                      jogoDestaque.gols_mandante !== null &&
                      jogoDestaque.gols_visitante !== null
                        ? `${jogoDestaque.gols_mandante} - ${jogoDestaque.gols_visitante}`
                        : "VS"}
                    </Texto>

                    <View
                      style={{
                        marginTop: 8,
                        backgroundColor: primaria + "20",
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        borderRadius: 20,
                      }}
                    >
                      <Texto
                        tamanho={11}
                        style={{
                          color: primaria,
                          fontWeight: "700",
                        }}
                      >
                        {ehResultado ? "FINALIZADO" : "PRÓXIMO JOGO"}
                      </Texto>
                    </View>
                  </View>

                  {/* VISITANTE */}

                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    {jogoDestaque.escudo_visitante ? (
                      <Image
                        source={{
                          uri: jogoDestaque.escudo_visitante,
                        }}
                        style={{
                          width: 90 * escalaEscudo,
                          height: 90 * escalaEscudo,
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 45,
                          backgroundColor: "#FFFFFF",
                        }}
                      />
                    )}

                    <Texto
                      tamanho={14}
                      style={{
                        color: texto,
                        textAlign: "center",
                        marginTop: 10,
                        fontWeight: "600",
                      }}
                    >
                      {jogoDestaque.visitante || "Visitante"}
                    </Texto>
                  </View>
                </View>

                {/* INFORMAÇÕES DO JOGO */}

                <View
                  style={{
                    marginTop: 24,
                    paddingTop: 18,
                    borderTopWidth: 1,
                    borderColor: borda,
                    alignItems: "center",
                  }}
                >
                  <Texto
                    tamanho={14}
                    style={{
                      color: textoSecundario,
                    }}
                  >
                    {dataFormatada || "Data a definir"} •{" "}
                    {horarioFormatado || "--:--"}
                  </Texto>

                  <Texto
                    tamanho={14}
                    style={{
                      color: textoSecundario,
                      marginTop: 5,
                    }}
                  >
                    {jogoDestaque.estadio || "Estádio não informado"}
                  </Texto>
                </View>
              </Pressable>
            )}
          </View>

          {/* ================================================= */}
          {/* ÚLTIMAS NOTÍCIAS */}
          {/* ================================================= */}

          <View style={{ marginBottom: 30 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Texto tamanho={21} style={tituloSecao}>
                Últimas notícias
              </Texto>

              <Pressable
                onPress={() => navigation.navigate("Noticias")}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Texto tamanho={13} style={{ color: textoSecundario }}>
                  Ver todas
                </Texto>

                <CaretRightIcon
                  size={18}
                  color={textoSecundario}
                />
              </Pressable>
            </View>

            {/* ESTADOS DA API */}

            {carregandoNoticias ? (
              <CardMensagem titulo="Carregando notícias..." />
            ) : erroNoticias ? (
              <CardMensagem
                titulo="Não foi possível carregar as notícias."
                descricao="Tente novamente mais tarde."
              />
            ) : noticias.length === 0 ? (
              <CardMensagem
                titulo="Nenhuma notícia encontrada."
                descricao="Novidades sobre o futebol aparecerão aqui."
              />
            ) : (
              <View
                style={{
                  flexDirection: telaMedia ? "row" : "column",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                {noticias.slice(0, 3).map((noticia, index) => (
                  <CardNoticia
                    key={`${noticia.url || noticia.titulo}-${index}`}
                    noticia={noticia}
                    index={index}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* DESAFIO DO DIA */}
          {/* ================================================= */}

          <View style={{ marginBottom: 25 }}>
            <Texto tamanho={21} style={tituloSecao}>
              Desafio do dia
            </Texto>

            <Pressable
              onPress={() => navigation.navigate("Quiz")}
              style={({ pressed }) => ({
                ...cardStyle,
                padding: 20,
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              {/* ÍCONE */}

              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: primaria,
                }}
              >
                <QuestionIcon
                  size={32}
                  color="#FFFFFF"
                  weight="bold"
                />
              </View>

              {/* DESCRIÇÃO */}

              <View style={{ flex: 1, marginLeft: 16 }}>
                <Texto
                  tamanho={16}
                  style={{
                    color: texto,
                    fontWeight: "700",
                  }}
                >
                  Quiz do dia
                </Texto>

                <Texto
                  tamanho={13}
                  style={{
                    color: textoSecundario,
                    marginTop: 5,
                  }}
                >
                  Teste seus conhecimentos sobre futebol!
                </Texto>
              </View>

              <CaretRightIcon
                size={24}
                color={textoSecundario}
                weight="bold"
              />
            </Pressable>
          </View>

          {/* ================================================= */}
          {/* CAMISA10 IA */}
          {/* ================================================= */}

          <Pressable
            onPress={() => navigation.navigate("Chatbot")}
            style={({ pressed }) => ({
              backgroundColor: primaria,
              borderRadius: 16,
              padding: 22,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <View style={{ flex: 1 }}>
              <Texto
                tamanho={12}
                style={{
                  color: "#FFFFFF",
                  opacity: 0.85,
                  fontWeight: "700",
                }}
              >
                SEU ASSISTENTE DE FUTEBOL
              </Texto>

              <Texto
                tamanho={20}
                style={{
                  color: "#FFFFFF",
                  fontWeight: "700",
                  marginTop: 5,
                }}
              >
                Converse com a Camisa10 IA
              </Texto>

              <Texto
                tamanho={13}
                style={{
                  color: "#FFFFFF",
                  marginTop: 5,
                }}
              >
                Notícias, times, curiosidades e muito mais.
              </Texto>
            </View>

            <CaretRightIcon
              size={28}
              color="#FFFFFF"
              weight="bold"
            />
          </Pressable>
        </ScrollView>
      </View>

      {/* ===================================================== */}
      {/* MODAL DE ACESSIBILIDADE */}
      {/* ===================================================== */}

      <Modal
        visible={modalAcessibilidade}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalAcessibilidade(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: overlay,
          }}
        >
          {/* FUNDO */}

          <Pressable
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            onPress={() => setModalAcessibilidade(false)}
          />

          {/* CONTEÚDO */}

          <View
            style={{
              width: "100%",
              maxWidth: 550,
              alignSelf: "center",
              backgroundColor: superficie,
              borderWidth: 1,
              borderColor: borda,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 32,
            }}
          >
            {/* CABEÇALHO */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View style={{ flex: 1 }}>
                <Texto
                  tamanho={21}
                  style={{
                    color: texto,
                    fontWeight: "700",
                  }}
                >
                  Acessibilidade
                </Texto>

                <Texto
                  tamanho={12}
                  style={{
                    color: textoSecundario,
                    marginTop: 5,
                  }}
                >
                  Ajustes rápidos para sua experiência
                </Texto>
              </View>

              <Pressable
                onPress={() => setModalAcessibilidade(false)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: superficieSecundaria,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: texto, fontSize: 24 }}>
                  ×
                </Text>
              </Pressable>
            </View>

            {/* TAMANHO DO TEXTO */}

            <Texto
              tamanho={14}
              style={{
                color: texto,
                marginBottom: 12,
                fontWeight: "600",
              }}
            >
              Tamanho do texto
            </Texto>

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                { id: "normal", titulo: "Normal" },
                { id: "grande", titulo: "Grande" },
                { id: "muitoGrande", titulo: "Muito grande" },
              ].map((item) => {
                const selecionado =
                  configuracoes.tamanhoTexto === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => alterarTamanhoTexto(item.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 5,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: selecionado ? primaria : borda,
                      backgroundColor: selecionado
                        ? primaria + "20"
                        : superficieSecundaria,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Texto
                      tamanho={12}
                      style={{
                        color: texto,
                        textAlign: "center",
                      }}
                    >
                      {item.titulo}
                    </Texto>
                  </Pressable>
                );
              })}
            </View>

            {/* TEXTO EM NEGRITO */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Texto tamanho={14} style={{ color: texto }}>
                  Texto em negrito
                </Texto>

                <Texto
                  tamanho={11}
                  style={{
                    color: textoSecundario,
                    marginTop: 4,
                  }}
                >
                  Destaca os textos da interface
                </Texto>
              </View>

              <Switch
                value={configuracoes.textoNegrito}
                onValueChange={() =>
                  alternarAcessibilidade("textoNegrito")
                }
                trackColor={{
                  false: borda,
                  true: primaria,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* ALTO CONTRASTE */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Texto tamanho={14} style={{ color: texto }}>
                  Alto contraste
                </Texto>

                <Texto
                  tamanho={11}
                  style={{
                    color: textoSecundario,
                    marginTop: 4,
                  }}
                >
                  Facilita a visualização dos elementos
                </Texto>
              </View>

              <Switch
                value={altoContraste}
                onValueChange={alternarAltoContraste}
                trackColor={{
                  false: borda,
                  true: primaria,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* CONFIGURAÇÕES COMPLETAS */}

            <Pressable
              onPress={() => {
                setModalAcessibilidade(false);
                navigation.navigate("Acessibilidade");
              }}
              style={({ pressed }) => ({
                marginTop: 20,
                paddingVertical: 15,
                borderRadius: 12,
                backgroundColor: primaria,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Texto
                tamanho={14}
                style={{
                  color: "#FFFFFF",
                  fontWeight: "700",
                }}
              >
                Configurações completas
              </Texto>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ===================================================== */}
      {/* BOTÃO FLUTUANTE CAMISA10 IA */}
      {/* ===================================================== */}

      <Pressable
        onPress={() => navigation.navigate("Chatbot")}
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
          transform: [{ scale: pressed ? 0.92 : 1 }],
          elevation: 6,
        })}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 23,
            fontWeight: "800",
          }}
        >
          AI
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}