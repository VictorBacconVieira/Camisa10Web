
import { useState, useEffect } from "react";

import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  Image,
  useWindowDimensions,
} from "react-native";

import {
  ArrowLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from "phosphor-react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Texto } from "../components/texto";
import { SideBar } from "../components/sideBar";

import { useAccessibility } from "../context/AccessibilityContext";
import { useTheme } from "../context/ThemeContext";

import { obterNoticias } from "../services/authService";

export function Noticias() {
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

  const larguraConteudo = telaGrande ? 1200 : 900;

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

  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [busca, setBusca] = useState("");

  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [timeFavorito, setTimeFavorito] = useState(null);
  const [atualizacao, setAtualizacao] = useState(0);

  // =====================================================
  // CATEGORIAS
  // =====================================================

  const categorias = [
    "Todas",
    "Seu Time",
    "Mercado da Bola",
    "Jogos",
  ];

  // =====================================================
  // CARREGAR NOTÍCIAS
  // =====================================================

  useEffect(() => {
    async function carregarNoticias() {
      try {
        setCarregando(true);
        setErro(null);

        const categoria = categoriaAtiva
          .toLowerCase()
          .replaceAll(" ", " ");

        const resultado = await obterNoticias(categoria);

        setNoticias(resultado?.noticias || []);
        setTimeFavorito(resultado?.time || null);
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);

        setErro(error.message);
        setNoticias([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarNoticias();
  }, [categoriaAtiva, atualizacao]);

  // =====================================================
  // FILTRAR NOTÍCIAS
  // =====================================================

  function normalizarTexto(valor) {
    return (valor || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const noticiasFiltradas = noticias.filter((noticia) => {
    const termo = normalizarTexto(busca.trim());

    const titulo = normalizarTexto(noticia.titulo);
    const fonte = normalizarTexto(noticia.fonte);
    const descricao = normalizarTexto(noticia.descricao);

    return (
      titulo.includes(termo) ||
      fonte.includes(termo) ||
      descricao.includes(termo)
    );
  });

  // =====================================================
  // FORMATAR TEMPO
  // =====================================================

  function formatarTempo(data) {
    if (!data) return "";

    const publicada = new Date(data);
    const agora = new Date();

    const diferenca = Math.floor(
      (agora - publicada) / 1000
    );

    if (diferenca < 60) return "Agora há pouco";

    const minutos = Math.floor(diferenca / 60);

    if (minutos < 60) {
      return `Há ${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {
      return `Há ${horas}h`;
    }

    const dias = Math.floor(horas / 24);

    if (dias < 7) {
      return `Há ${dias} dias`;
    }

    return publicada.toLocaleDateString("pt-BR");
  }

  // =====================================================
  // CATEGORIA DE EXIBIÇÃO
  // =====================================================

  function obterCategoriaExibicao() {
    const categoriasExibicao = {
      todas: "Futebol",
      "seu time": timeFavorito || "Seu Time",
      "mercado da bola": "Mercado da Bola",
      jogos: "Jogos",
    };

    return (
      categoriasExibicao[
        categoriaAtiva.toLowerCase()
      ] || "Futebol"
    );
  }

  // =====================================================
  // ABRIR NOTÍCIA
  // =====================================================

  async function abrirNoticia(noticia) {
    if (!noticia?.url) {
      console.warn(
        "Link indisponível para esta notícia."
      );
      return;
    }

    try {
      await Linking.openURL(noticia.url);
    } catch (error) {
      console.error(
        "Erro ao abrir notícia:",
        error
      );
    }
  }

  // =====================================================
  // ESTILOS BASE
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
  // CARD DE ESTADO
  // =====================================================

  function CardMensagem({ titulo, descricao }) {
    return (
      <View
        style={{
          ...cardStyle,
          padding: 22,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 130,
        }}
      >
        <Texto
          tamanho={14}
          style={{
            color: texto,
            textAlign: "center",
          }}
        >
          {titulo}
        </Texto>

        {descricao ? (
          <Texto
            tamanho={12}
            style={{
              color: textoSecundario,
              textAlign: "center",
              marginTop: 7,
            }}
          >
            {descricao}
          </Texto>
        ) : null}
      </View>
    );
  }

  // =====================================================
  // INFORMAÇÕES DA NOTÍCIA
  // =====================================================

  function InformacoesNoticia({ noticia, destaque = false }) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          marginTop: destaque ? 12 : 8,
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
              width: destaque ? 18 : 15,
              height: destaque ? 18 : 15,
              borderRadius: 4,
            }}
            resizeMode="contain"
          />
        ) : null}

        <Texto
          tamanho={destaque ? 12 : 10}
          style={{
            color: textoSecundario,
          }}
        >
          {noticia.fonte || "Fonte"}
        </Texto>

        <Texto
          tamanho={destaque ? 12 : 10}
          style={{
            color: textoTerciario,
          }}
        >
          •
        </Texto>

        <Texto
          tamanho={destaque ? 12 : 10}
          style={{
            color: textoSecundario,
          }}
        >
          {formatarTempo(noticia.publicado_em)}
        </Texto>
      </View>
  );
  }

  // =====================================================
  // CARD DE DESTAQUE
  // =====================================================

  function CardDestaque({ noticia }) {
    return (
      <Pressable
        onPress={() => abrirNoticia(noticia)}
        accessibilityRole="button"
        style={({ pressed }) => ({
          ...cardStyle,
          opacity: pressed ? 0.85 : 1,
          transform: [
            { scale: pressed ? 0.985 : 1 },
          ],
        })}
      >
        {/* IMAGEM */}

        {noticia.imagem ? (
          <Image
            source={{ uri: noticia.imagem }}
            style={{
              width: "100%",
              height: telaGrande ? 280 : 220,
              backgroundColor: superficieSecundaria,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              height: 220,
              backgroundColor: superficieSecundaria,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Texto
              tamanho={13}
              style={{ color: textoSecundario }}
            >
              Imagem indisponível
            </Texto>
          </View>
        )}

        {/* CONTEÚDO */}

        <View style={{ padding: telaMedia ? 22 : 16 }}>
          <Texto
            tamanho={12}
            style={{
              color: primaria,
              fontWeight: "700",
              marginBottom: 10,
            }}
          >
            {obterCategoriaExibicao().toUpperCase()}
          </Texto>

          <Texto
            tamanho={telaMedia ? 22 : 18}
            style={{
              color: texto,
              fontWeight: "700",
              lineHeight: telaMedia ? 31 : 26,
            }}
          >
            {noticia.titulo || "Notícia sem título"}
          </Texto>

          {noticia.descricao ? (
            <Texto
              tamanho={14}
              style={{
                color: textoSecundario,
                marginTop: 10,
                lineHeight: 22,
              }}
            >
              {noticia.descricao}
            </Texto>
          ) : null}

          <InformacoesNoticia
            noticia={noticia}
            destaque
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <Texto
              tamanho={13}
              style={{
                color: primaria,
                fontWeight: "700",
              }}
            >
              Ler notícia
            </Texto>

            <CaretRightIcon
              size={18}
              color={primaria}
              weight="bold"
            />
          </View>
        </View>
      </Pressable>
    );
  }

  // =====================================================
  // CARD DE NOTÍCIA RECENTE
  // =====================================================

  function CardNoticia({ noticia, index }) {
    return (
      <Pressable
        key={`${noticia.url || noticia.titulo}-${index}`}
        onPress={() => abrirNoticia(noticia)}
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: "100%",
          flexDirection: "row",
          backgroundColor: superficie,
          borderWidth: 1,
          borderColor: borda,
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 14,
          opacity: pressed ? 0.85 : 1,
          transform: [
            { scale: pressed ? 0.985 : 1 },
          ],
        })}
      >
        {/* IMAGEM */}

        {noticia.imagem ? (
          <Image
            source={{ uri: noticia.imagem }}
            style={{
              width: telaMedia ? 190 : 115,
              height: telaMedia ? 145 : 120,
              backgroundColor: superficieSecundaria,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: telaMedia ? 190 : 115,
              height: telaMedia ? 145 : 120,
              backgroundColor: superficieSecundaria,
              alignItems: "center",
              justifyContent: "center",
              padding: 5,
            }}
          >
            <Texto
              tamanho={10}
              style={{
                color: textoSecundario,
                textAlign: "center",
              }}
            >
              Imagem indisponível
            </Texto>
          </View>
        )}

        {/* CONTEÚDO */}

        <View
          style={{
            flex: 1,
            padding: telaMedia ? 16 : 11,
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <Texto
            tamanho={11}
            style={{
              color: primaria,
              fontWeight: "700",
              marginBottom: 5,
            }}
          >
            {obterCategoriaExibicao()}
          </Texto>

          <Texto
            tamanho={telaMedia ? 15 : 13}
            style={{
              color: texto,
              fontWeight: "600",
              lineHeight: telaMedia ? 22 : 19,
            }}
          >
            {noticia.titulo || "Notícia sem título"}
          </Texto>

          <InformacoesNoticia noticia={noticia} />
        </View>

        {/* SETA */}

        <View
          style={{
            justifyContent: "center",
            paddingHorizontal: 10,
          }}
        >
          <CaretRightIcon
            size={18}
            color={textoSecundario}
            weight="bold"
          />
        </View>
      </Pressable>
    );
  }

  // =====================================================
  // NOTÍCIAS
  // =====================================================

  const noticiaDestaque = noticiasFiltradas[0];

  const ultimasNoticias = noticiasFiltradas.slice(1);

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

        {/* ÁREA PRINCIPAL */}

        <View
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: telaMedia ? 28 : 16,
              paddingTop: 24,
              paddingBottom: 120,
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
                  Notícias
                </Texto>

                <Texto
                  tamanho={13}
                  style={{
                    color: textoSecundario,
                    marginTop: 4,
                  }}
                >
                  Fique por dentro de tudo que acontece no futebol.
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
                weight="regular"
              />

              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar notícias"
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
                returnKeyType="search"
                accessibilityLabel="Buscar notícias"
              />
            </View>

            {/* ================================================= */}
            {/* CATEGORIAS */}
            {/* ================================================= */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 9,
                paddingBottom: 4,
              }}
              style={{ marginBottom: 26 }}
            >
              {categorias.map((categoria) => {
                const ativa = categoriaAtiva === categoria;

                return (
                  <Pressable
                    key={categoria}
                    onPress={() => setCategoriaAtiva(categoria)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 18,
                      paddingVertical: 11,
                      borderRadius: 30,
                      backgroundColor: ativa
                        ? primaria
                        : superficie,
                      borderWidth: ativa ? 0 : 1,
                      borderColor: borda,
                      opacity: pressed ? 0.75 : 1,
                      transform: [
                        { scale: pressed ? 0.96 : 1 },
                      ],
                    })}
                  >
                    <Texto
                      tamanho={13}
                      style={{
                        color: ativa ? "#FFFFFF" : texto,
                        fontWeight: ativa ? "700" : "500",
                      }}
                    >
                      {categoria}
                    </Texto>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ================================================= */}
            {/* DESTAQUE */}
            {/* ================================================= */}

            <View style={{ marginBottom: 30 }}>
              <Texto
                tamanho={21}
                style={{
                  ...tituloSecao,
                  marginBottom: 14,
                }}
              >
                Destaque
              </Texto>

              {/* CARREGANDO */}

              {carregando ? (
                <CardMensagem
                  titulo="Carregando notícias..."
                  descricao="Estamos buscando as últimas novidades do futebol."
                />
              ) : null}

              {/* ERRO */}

              {!carregando && erro ? (
                <View
                  style={{
                    ...cardStyle,
                    padding: 22,
                    alignItems: "center",
                  }}
                >
                  <Texto
                    tamanho={14}
                    style={{
                      color: texto,
                      textAlign: "center",
                    }}
                  >
                    Não foi possível carregar as notícias.
                  </Texto>

                  <Texto
                    tamanho={12}
                    style={{
                      color: textoSecundario,
                      textAlign: "center",
                      marginTop: 6,
                    }}
                  >
                    Verifique sua conexão e tente novamente.
                  </Texto>

                  <Pressable
                    onPress={() =>
                      setAtualizacao((valor) => valor + 1)
                    }
                    style={({ pressed }) => ({
                      backgroundColor: primaria,
                      paddingHorizontal: 20,
                      paddingVertical: 11,
                      borderRadius: 10,
                      marginTop: 16,
                      opacity: pressed ? 0.75 : 1,
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

              {/* NOTÍCIA EM DESTAQUE */}

              {!carregando && !erro && noticiaDestaque ? (
                <CardDestaque noticia={noticiaDestaque} />
              ) : null}

              {/* NENHUMA NOTÍCIA */}

              {!carregando && !erro && !noticiaDestaque ? (
                <CardMensagem
                  titulo="Nenhuma notícia encontrada."
                  descricao="Tente outra categoria ou altere sua pesquisa."
                />
              ) : null}
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
                  marginBottom: 15,
                }}
              >
                <Texto tamanho={21} style={tituloSecao}>
                  Últimas notícias
                </Texto>

                {!carregando && !erro ? (
                  <Texto
                    tamanho={12}
                    style={{ color: textoSecundario }}
                  >
                    {ultimasNoticias.length} notícias
                  </Texto>
                ) : null}
              </View>

              {!carregando && !erro && ultimasNoticias.length > 0 ? (
                <View>
                  {ultimasNoticias.map((noticia, index) => (
                    <CardNoticia
                      key={`${noticia.url || noticia.titulo}-${index}`}
                      noticia={noticia}
                      index={index}
                    />
                  ))}
                </View>
              ) : null}

              {!carregando &&
              !erro &&
              noticiaDestaque &&
              ultimasNoticias.length === 0 ? (
                <Texto
                  tamanho={13}
                  style={{
                    color: textoTerciario,
                    marginBottom: 15,
                  }}
                >
                  Não há outras notícias nesta seleção.
                </Texto>
              ) : null}
            </View>

          </ScrollView>
        </View>
      </View>

      {/* ===================================================== */}
      {/* BOTÃO FLUTUANTE CAMISA10 IA */}
      {/* ===================================================== */}

      <Pressable
        onPress={() => navigation.navigate("Chatbot")}
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
          shadowOffset: { width: 0, height: 4 },
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