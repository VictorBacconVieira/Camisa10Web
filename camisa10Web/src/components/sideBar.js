
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  HouseIcon,
  NewspaperIcon,
  SoccerBallIcon,
  QuestionIcon,
  UserIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "phosphor-react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

const itensNavegacao = [
  {
    nome: "Início",
    tela: "Home",
    icone: HouseIcon,
  },
  {
    nome: "Notícias",
    tela: "Noticias",
    icone: NewspaperIcon,
  },
  {
    nome: "Jogos",
    tela: "Jogos",
    icone: SoccerBallIcon,
  },
  {
    nome: "Quiz",
    tela: "Quiz",
    icone: QuestionIcon,
  },
  {
    nome: "Perfil",
    tela: "Perfil",
    icone: UserIcon,
  },
];

export function SideBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const { cores } = useTheme();

  const [expandida, setExpandida] = useState(true);

  const largura = expandida ? 240 : 76;

  // =================================================
  // CORES DO TEMA
  // =================================================

  const corFundo = cores.background;
  const corSuperficie = cores.surface;
  const corSuperficieSecundaria = cores.surfaceSecondary;
  const corBorda = cores.border;
  const corTexto = cores.text;
  const corTextoSecundario = cores.textSecondary;
  const corPrimaria = cores.primary;
  const corIcone = cores.icon;
  const corOverlay = cores.overlay;

  return (
    <View
      style={{
        width: largura,
        minHeight: "100%",
        backgroundColor: corFundo,
        borderRightWidth: 1,
        borderRightColor: corBorda,
        paddingHorizontal: expandida ? 16 : 10,
        paddingTop: 24,
        paddingBottom: 20,
        transition: "width 0.25s ease",
      }}
    >
      {/* ================================================= */}
      {/* LOGO */}
      {/* ================================================= */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: expandida ? "flex-start" : "center",
          gap: 12,
          marginBottom: 36,
          paddingHorizontal: 4,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: corPrimaria,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SoccerBallIcon
            size={26}
            color={corFundo}
            weight="fill"
          />
        </View>

        {expandida && (
          <View>
            <Text
              style={{
                color: corTexto,
                fontSize: 20,
                fontWeight: "800",
              }}
            >
              Camisa10
            </Text>

            <Text
              style={{
                color: corTextoSecundario,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Futebol em um só lugar
            </Text>
          </View>
        )}
      </View>

      {/* ================================================= */}
      {/* TITULO DA NAVEGAÇÃO */}
      {/* ================================================= */}

      {expandida && (
        <Text
          style={{
            color: corTextoSecundario,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
            marginBottom: 12,
            marginLeft: 8,
          }}
        >
          MENU PRINCIPAL
        </Text>
      )}

      {/* ================================================= */}
      {/* NAVEGAÇÃO */}
      {/* ================================================= */}

      <View style={{ gap: 8 }}>
        {itensNavegacao.map((item) => {
          const ativo = route.name === item.tela;
          const Icon = item.icone;

          return (
            <Pressable
              key={item.tela}
              onPress={() => navigation.navigate(item.tela)}
              style={({ hovered, pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: expandida ? "flex-start" : "center",
                height: 48,
                paddingHorizontal: expandida ? 14 : 0,
                borderRadius: 12,
                gap: 12,

                backgroundColor: ativo
                  ? `${corPrimaria}15`
                  : hovered
                  ? corOverlay
                  : "transparent",

                borderWidth: ativo ? 1 : 0,
                borderColor: ativo
                  ? `${corPrimaria}40`
                  : "transparent",

                opacity: pressed ? 0.75 : 1,

                transition: "all 0.2s ease",
              })}
            >
              <Icon
                size={22}
                color={ativo ? corPrimaria : corIcone}
                weight={ativo ? "fill" : "regular"}
              />

              {expandida && (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: ativo ? "700" : "500",
                    color: ativo ? corPrimaria : corTextoSecundario,
                  }}
                >
                  {item.nome}
                </Text>
              )}

              {!expandida && (
                <View
                  style={{
                    position: "absolute",
                    left: 65,
                    backgroundColor: corSuperficieSecundaria,
                    borderWidth: 1,
                    borderColor: corBorda,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 8,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                >
                  <Text
                    style={{
                      color: corTexto,
                      fontSize: 12,
                    }}
                  >
                    {item.nome}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ================================================= */}
      {/* ESPAÇO */}
      {/* ================================================= */}

      <View style={{ flex: 1 }} />

      {/* ================================================= */}
      {/* BOTÃO EXPANDIR / RECOLHER */}
      {/* ================================================= */}

      <Pressable
        onPress={() => setExpandida(!expandida)}
        style={({ hovered, pressed }) => ({
          height: 44,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: expandida ? "flex-start" : "center",
          paddingHorizontal: expandida ? 14 : 0,
          gap: 12,
          borderRadius: 10,

          backgroundColor: hovered
            ? corOverlay
            : "transparent",

          opacity: pressed ? 0.7 : 1,
          transition: "all 0.2s ease",
        })}
      >
        {expandida ? (
          <>
            <CaretLeftIcon
              size={20}
              color={corIcone}
            />

            <Text
              style={{
                color: corTextoSecundario,
                fontSize: 13,
              }}
            >
              Recolher menu
            </Text>
          </>
        ) : (
          <CaretRightIcon
            size={20}
            color={corIcone}
          />
        )}
      </Pressable>
    </View>
  );
}