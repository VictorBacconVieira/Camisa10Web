import { Pressable, Text, TextInput, View } from "react-native";

import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
} from "phosphor-react-native";

import { useRoute } from "@react-navigation/native";

const titulos = {
  Home: "Início",
  Noticias: "Notícias",
  Jogos: "Jogos",
  Quiz: "Quiz",
  Perfil: "Meu perfil",
};

export default function Header() {
  const route = useRoute();

  const titulo = titulos[route.name] || "Camisa10";

  return (
    <View
      style={{
        height: 76,
        width: "100%",
        backgroundColor: "#111D27",
        borderBottomWidth: 1,
        borderBottomColor: "#26343E",
        paddingHorizontal: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      {/* TITULO */}
      <View>
        <Text
          style={{
            color: "#F5F7F8",
            fontSize: 21,
            fontWeight: "700",
          }}
        >
          {titulo}
        </Text>

        <Text
          style={{
            color: "#6F7B83",
            fontSize: 12,
            marginTop: 3,
          }}
        >
          Acompanhe tudo sobre o mundo do futebol
        </Text>
      </View>

      {/* AREA DIREITA */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 18,
        }}
      >
        {/* PESQUISA */}
        <View
          style={{
            width: 260,
            height: 42,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#16232D",
            borderWidth: 1,
            borderColor: "#26343E",
            borderRadius: 12,
            paddingHorizontal: 12,
            gap: 10,
          }}
        >
          <MagnifyingGlassIcon
            size={19}
            color="#6F7B83"
          />

          <TextInput
            placeholder="Pesquisar..."
            placeholderTextColor="#6F7B83"
            style={{
              flex: 1,
              color: "#F5F7F8",
              fontSize: 13,
              outlineStyle: "none",
            }}
          />
        </View>

        {/* NOTIFICAÇÕES */}
        <Pressable
          style={({ hovered, pressed }) => ({
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            backgroundColor: hovered ? "#FFFFFF08" : "transparent",
            opacity: pressed ? 0.7 : 1,
            transition: "all 0.2s ease",
            position: "relative",
          })}
        >
          <BellIcon
            size={22}
            color="#A8B2B9"
          />

          {/* INDICADOR */}
          <View
            style={{
              position: "absolute",
              top: 9,
              right: 9,
              width: 8,
              height: 8,
              borderRadius: 50,
              backgroundColor: "#00C853",
            }}
          />
        </Pressable>

        {/* DIVISOR */}
        <View
          style={{
            height: 34,
            width: 1,
            backgroundColor: "#26343E",
          }}
        />

        {/* USUARIO */}
        <Pressable
          style={({ hovered, pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 5,
            paddingRight: 10,
            borderRadius: 12,
            backgroundColor: hovered ? "#FFFFFF08" : "transparent",
            opacity: pressed ? 0.7 : 1,
            transition: "all 0.2s ease",
          })}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 50,
              backgroundColor: "#26343E",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#00C85350",
            }}
          >
            <UserCircleIcon
              size={25}
              color="#00C853"
              weight="regular"
            />
          </View>

          <View>
            <Text
              style={{
                color: "#F5F7F8",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Usuário
            </Text>

            <Text
              style={{
                color: "#6F7B83",
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Minha conta
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}