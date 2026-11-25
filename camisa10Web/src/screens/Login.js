
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  ArrowRightIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  LockIcon,
  WarningCircleIcon,
  XIcon,
} from "phosphor-react-native";

import { useNavigation } from "@react-navigation/native";

import Input from "../components/input";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

// ==================================================
// CONFIGURAÇÃO GOOGLE
// ==================================================

GoogleSignin.configure({
  webClientId:
    "407036789216-kolklnt63u97lq8m58gp0idl3ps71ru2.apps.googleusercontent.com",
});

// ==================================================
// POP-UP PERSONALIZADO
// ==================================================

function ModalAlerta({
  visible,
  titulo,
  mensagem,
  tipo = "erro",
  onClose,
}) {
  const { cores } = useTheme();

  const opacidade = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.9)).current;
  const deslocamento = useRef(new Animated.Value(20)).current;

  const fechando = useRef(false);

  const nativeDriver = Platform.OS !== "web";

  // ==================================================
  // ANIMAÇÃO DE ENTRADA
  // ==================================================

  useEffect(() => {
    if (!visible) return;

    fechando.current = false;

    opacidade.setValue(0);
    escala.setValue(0.9);
    deslocamento.setValue(20);

    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: nativeDriver,
      }),

      Animated.spring(escala, {
        toValue: 1,
        friction: 8,
        tension: 65,
        useNativeDriver: nativeDriver,
      }),

      Animated.timing(deslocamento, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: nativeDriver,
      }),
    ]).start();
  }, [visible]);

  // ==================================================
  // ANIMAÇÃO DE SAÍDA
  // ==================================================

  function fechar() {
    if (fechando.current) return;

    fechando.current = true;

    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: nativeDriver,
      }),

      Animated.timing(escala, {
        toValue: 0.94,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: nativeDriver,
      }),

      Animated.timing(deslocamento, {
        toValue: 10,
        duration: 160,
        useNativeDriver: nativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }

  // ==================================================
  // CONFIGURAÇÃO DOS TIPOS
  // ==================================================

  const configuracao = {
    erro: {
      cor: "#E53935",
      fundoIcone: "#351D20",
      Icone: WarningCircleIcon,
      tituloBotao: "Entendi",
      identificacao: "OPS! ALGO DEU ERRADO",
    },

    sucesso: {
      cor: "#00C853",
      fundoIcone: "#123323",
      Icone: CheckCircleIcon,
      tituloBotao: "Continuar",
      identificacao: "TUDO CERTO!",
    },

    aviso: {
      cor: "#FFC107",
      fundoIcone: "#332B16",
      Icone: InfoIcon,
      tituloBotao: "Entendi",
      identificacao: "ATENÇÃO",
    },
  };

  const atual = configuracao[tipo] || configuracao.erro;
  const Icone = atual.Icone;

  // ==================================================
  // MODAL
  // ==================================================

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={fechar}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* FUNDO ESCURECIDO */}

        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "#000000",
            opacity: opacidade.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.72],
            }),
          }}
        />

        {/* CARTÃO PRINCIPAL */}

        <Animated.View
          style={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 24,
            overflow: "hidden",

            backgroundColor: cores.surface,

            borderWidth: 1,
            borderColor: cores.border,

            opacity: opacidade,

            transform: [
              { scale: escala },
              { translateY: deslocamento },
            ],

            shadowColor: "#000000",
            shadowOffset: {
              width: 0,
              height: 14,
            },
            shadowOpacity: 0.35,
            shadowRadius: 24,
            elevation: 20,

            ...(Platform.OS === "web"
              ? {
                  boxShadow:
                    "0px 18px 55px rgba(0, 0, 0, 0.45)",
                }
              : {}),
          }}
        >
          {/* BARRA COLORIDA SUPERIOR */}

          <View
            style={{
              width: "100%",
              height: 4,
              backgroundColor: atual.cor,
            }}
          />

          {/* CONTEÚDO */}

          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 22,
            }}
          >
            {/* ÍCONE E BOTÃO FECHAR */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* ÍCONE */}

              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,

                  justifyContent: "center",
                  alignItems: "center",

                  backgroundColor: atual.fundoIcone,

                  borderWidth: 1,
                  borderColor: `${atual.cor}50`,
                }}
              >
                <Icone
                  size={32}
                  color={atual.cor}
                  weight="fill"
                />
              </View>

              {/* BOTÃO FECHAR */}

              <Pressable
                onPress={fechar}
                hitSlop={10}
                style={({ pressed }) => ({
                  width: 38,
                  height: 38,
                  borderRadius: 50,

                  justifyContent: "center",
                  alignItems: "center",

                  backgroundColor: cores.surfaceSecondary,

                  opacity: pressed ? 0.65 : 1,

                  ...(Platform.OS === "web"
                    ? {
                        cursor: "pointer",
                      }
                    : {}),
                })}
              >
                <XIcon
                  size={19}
                  color={cores.textSecondary}
                  weight="bold"
                />
              </Pressable>
            </View>

            {/* IDENTIFICAÇÃO */}

            <Text
              style={{
                marginTop: 22,

                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1.5,

                color: atual.cor,

                fontFamily: "Inter",
              }}
            >
              {atual.identificacao}
            </Text>

            {/* TÍTULO */}

            <Text
              style={{
                marginTop: 8,

                fontSize: 23,
                lineHeight: 31,
                fontWeight: "700",

                color: cores.text,

                fontFamily: "Anuphan",
              }}
            >
              {titulo}
            </Text>

            {/* MENSAGEM */}

            <Text
              style={{
                marginTop: 12,

                fontSize: 14,
                lineHeight: 23,

                color: cores.textSecondary,

                fontFamily: "Inter",
              }}
            >
              {mensagem}
            </Text>

            {/* BOTÃO PRINCIPAL */}

            <Pressable
              onPress={fechar}
              style={({ pressed }) => ({
                marginTop: 26,

                height: 50,
                width: "100%",

                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",

                borderRadius: 12,

                backgroundColor: atual.cor,

                opacity: pressed ? 0.85 : 1,

                ...(Platform.OS === "web"
                  ? {
                      cursor: "pointer",
                      transition: "opacity 150ms ease",
                    }
                  : {}),
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",

                  color: "#FFFFFF",

                  fontFamily: "Inter",
                }}
              >
                {atual.tituloBotao}
              </Text>
            </Pressable>

            {/* RODAPÉ */}

            <Text
              style={{
                marginTop: 20,

                fontSize: 10,
                letterSpacing: 1,

                textAlign: "center",

                color: cores.textTertiary || "#6F7B83",

                fontFamily: "Inter",
              }}
            >
              CAMISA10 • JUNTOS EM CAMPO
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ==================================================
// TELA DE LOGIN
// ==================================================

export function Login() {
  const navigation = useNavigation();

  const { cores } = useTheme();

  const { width } = useWindowDimensions();

  // ==================================================
  // RESPONSIVIDADE
  // ==================================================

  const desktop = Platform.OS === "web" && width >= 950;
  const mobileWeb = Platform.OS === "web" && width < 950;

  // ==================================================
  // ESTADOS
  // ==================================================

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [alerta, setAlerta] = useState({
    visible: false,
    titulo: "",
    mensagem: "",
    tipo: "erro",
  });

  const emailRef = useRef(null);
  const senhaRef = useRef(null);

  const acaoAlertaRef = useRef(null);

  const {
    entrar: loginContexto,
    entrarComGoogle: loginGoogleContexto,
  } = useAuth();

  // ==================================================
  // EXIBIR POP-UP
  // ==================================================

  function mostrarAlerta(
    titulo,
    mensagem,
    tipo = "erro",
    acao = null
  ) {
    acaoAlertaRef.current = acao;

    setAlerta({
      visible: true,
      titulo,
      mensagem,
      tipo,
    });
  }

  // ==================================================
  // FECHAR POP-UP
  // ==================================================

  function fecharAlerta() {
    setAlerta((anterior) => ({
      ...anterior,
      visible: false,
    }));

    const acao = acaoAlertaRef.current;
    acaoAlertaRef.current = null;

    if (acao) {
      setTimeout(() => {
        acao();
      }, 100);
    }
  }

  // ==================================================
  // VALIDAÇÃO DO E-MAIL
  // ==================================================

  function emailValido(valor) {
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return formatoEmail.test(valor.trim());
  }

  // ==================================================
  // AUTENTICAÇÃO
  // ==================================================

  async function autenticarUsuario(emailUsuario, senhaUsuario) {
    return await loginContexto(emailUsuario, senhaUsuario);
  }

  // ==================================================
  // FUNÇÃO ENTRAR
  // ==================================================

  async function entrar() {
    if (carregando) return;

    Keyboard.dismiss();

    const emailDigitado = email.trim();

    // CAMPOS VAZIOS

    if (!emailDigitado && !senha.trim()) {
      mostrarAlerta(
        "Campos obrigatórios",
        "Preencha todos os campos para continuar.",
        "aviso",
        () => emailRef.current?.focus()
      );

      return;
    }

    if (!emailDigitado) {
      mostrarAlerta(
        "E-mail obrigatório",
        "Preencha o campo de e-mail para continuar.",
        "aviso",
        () => emailRef.current?.focus()
      );

      return;
    }

    if (!senha.trim()) {
      mostrarAlerta(
        "Senha obrigatória",
        "Preencha o campo de senha para continuar.",
        "aviso",
        () => senhaRef.current?.focus()
      );

      return;
    }

    // FORMATO DO E-MAIL

    if (!emailValido(emailDigitado)) {
      mostrarAlerta(
        "E-mail inválido",
        "Digite um endereço de e-mail válido, por exemplo: usuario@gmail.com.",
        "erro",
        () => emailRef.current?.focus()
      );

      return;
    }

    // AUTENTICAÇÃO

    try {
      setCarregando(true);

      const autenticado = await autenticarUsuario(
        emailDigitado,
        senha
      );

      if (autenticado?.access_token) {
        mostrarAlerta(
          "Login realizado!",
          "Bem-vindo ao Camisa10! Prepare-se para entrar em campo.",
          "sucesso",
          () => navigation.navigate("Home")
        );

        return;
      }

      mostrarAlerta(
        "Não foi possível entrar",
        "O e-mail ou a senha estão incorretos. Verifique seus dados e tente novamente.",
        "erro"
      );
    } catch (erro) {
      console.log("Erro ao entrar:", erro);

      mostrarAlerta(
        "Erro ao entrar",
        "Não foi possível realizar o login. Tente novamente mais tarde.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==================================================
  // LOGIN COM GOOGLE
  // ==================================================

  async function entrarComGoogle() {
    if (carregando) return;

    // O Google Sign-In nativo ainda não está configurado para Web.
    if (Platform.OS === "web") {
      mostrarAlerta(
        "Login Google indisponível",
        "O acesso com Google pela versão Web será implementado posteriormente.",
        "aviso"
      );

      return;
    }

    try {
      Keyboard.dismiss();
      setCarregando(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const resposta = await GoogleSignin.signIn();

      if (!isSuccessResponse(resposta)) {
        return;
      }

      const idToken = resposta.data.idToken;

      if (!idToken) {
        throw new Error("Não foi possível obter o token do Google.");
      }

      const autenticado = await loginGoogleContexto(idToken);

      if (autenticado?.access_token) {
        mostrarAlerta(
          "Login realizado!",
          "Bem-vindo ao Camisa10! Prepare-se para entrar em campo.",
          "sucesso",
          () => navigation.navigate("Home")
        );
      }
    } catch (erro) {
      console.log("Erro no login Google:", erro);

      mostrarAlerta(
        "Erro ao entrar com Google",
        erro?.message || "Não foi possível realizar o login. Tente novamente.",
        "erro"
      );
    } finally {
      setCarregando(false);
    }
  }

  // ==================================================
  // IDENTIDADE VISUAL
  // ==================================================

  function PainelMarca() {
    return (
      <View
        style={{
          flex: desktop ? 1 : undefined,
          alignItems: desktop ? "flex-start" : "center",
          justifyContent: desktop ? "center" : "center",

          paddingVertical: desktop ? 40 : 12,

          ...(desktop
            ? {
                paddingRight: 55,
              }
            : {}),
        }}
      >
        {/* LOGO */}

        <Image
          source={require("../../assets/Logo.png")}
          resizeMode="contain"
          style={{
            width: desktop ? 260 : 145,
            height: desktop ? 260 : 145,
          }}
        />

        {/* NOME */}

        <Text
          style={{
            marginTop: desktop ? 18 : 4,

            fontSize: desktop ? 64 : 36,
            lineHeight: desktop ? 76 : 44,

            fontWeight: "500",
            textAlign: desktop ? "left" : "center",

            fontFamily: "Anuphan",
            color: cores.text,
          }}
        >
          Camisa
          <Text
            style={{
              color: "#39FF14",
            }}
          >
            10
          </Text>
        </Text>

        {/* SLOGAN */}

        <Text
          style={{
            marginTop: 12,

            fontSize: desktop ? 22 : 16,
            lineHeight: desktop ? 34 : 24,

            textAlign: desktop ? "left" : "center",

            fontFamily: "Anuphan",
            color: cores.textSecondary,

            maxWidth: desktop ? 460 : 350,
          }}
        >
          O futebol vai muito além dos{" "}
          <Text
            style={{
              color: "#39FF14",
              fontWeight: "700",
            }}
          >
            90 minutos.
          </Text>
        </Text>

        {/* DESCRIÇÃO DESKTOP */}

        {desktop && (
          <View
            style={{
              marginTop: 32,

              paddingLeft: 18,

              borderLeftWidth: 3,
              borderLeftColor: "#00C853",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                lineHeight: 25,

                fontFamily: "Inter",
                color: cores.textSecondary,

                maxWidth: 390,
              }}
            >
              Notícias, partidas, desafios, estatísticas e
              tudo o que conecta você ao esporte mais
              apaixonante do mundo.
            </Text>
          </View>
        )}

        {/* FRASE DE IDENTIDADE */}

        <View
          style={{
            marginTop: desktop ? 40 : 22,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 2.5,
              fontWeight: "800",

              textAlign: desktop ? "left" : "center",

              fontFamily: "Inter",
              color: "#39FF14",
            }}
          >
            CAMISA10 • JUNTOS EM CAMPO
          </Text>
        </View>
      </View>
    );
  }

  // ==================================================
  // FORMULÁRIO
  // ==================================================

  function FormularioLogin() {
    return (
      <View
        style={{
          width: "100%",
        }}
      >
        {/* BOAS-VINDAS */}

        <View
          style={{
            marginBottom: 28,
          }}
        >
          <Text
            style={{
              fontSize: desktop ? 30 : 26,
              lineHeight: desktop ? 40 : 36,

              fontFamily: "Anuphan",
              fontWeight: "600",

              color: cores.text,
            }}
          >
            Bem-vindo,{" "}
            <Text
              style={{
                color: "#39FF14",
              }}
            >
              jogador!
            </Text>
          </Text>

          <Text
            style={{
              marginTop: 8,

              fontSize: 15,
              lineHeight: 23,

              fontFamily: "Inter",
              color: cores.textSecondary,
            }}
          >
            Faça login para continuar
          </Text>
        </View>

        {/* E-MAIL */}

        <View
          style={{
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              marginBottom: 9,

              fontSize: 15,

              fontFamily: "Anuphan",
              color: cores.text,
            }}
          >
            E-mail
          </Text>

          <Input
            ref={emailRef}
            icon={EnvelopeIcon}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />
        </View>

        {/* SENHA */}

        <View>
          <Text
            style={{
              marginBottom: 9,

              fontSize: 15,

              fontFamily: "Anuphan",
              color: cores.text,
            }}
          >
            Senha
          </Text>

          <Input
            ref={senhaRef}
            icon={LockIcon}
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            returnKeyType="done"
            onSubmitEditing={entrar}
            rightIcon={mostrarSenha ? EyeSlashIcon : EyeIcon}
            onRightIconPress={() =>
              setMostrarSenha(!mostrarSenha)
            }
          />
        </View>

        {/* ESQUECEU A SENHA */}

        <Pressable
          style={{
            marginTop: 14,
            alignSelf: "flex-end",
            ...(Platform.OS === "web"
              ? {
                  cursor: "pointer",
                }
              : {}),
          }}
          onPress={() => {
            // Implementaremos posteriormente.
          }}
        >
          <Text
            style={{
              fontSize: 14,

              fontFamily: "Anuphan",
              color: "#39FF14",
            }}
          >
            Esqueceu sua senha?
          </Text>
        </Pressable>

        {/* BOTÃO ENTRAR */}

        <Pressable
          onPress={entrar}
          disabled={carregando}
          style={({ pressed }) => ({
            marginTop: 26,

            height: 52,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: 12,

            backgroundColor: cores.primary,

            opacity: carregando ? 0.7 : pressed ? 0.85 : 1,

            ...(Platform.OS === "web"
              ? {
                    cursor: carregando ? "not-allowed" : "pointer",
                    transition: "opacity 150ms ease",
                  }
              : {}),
          })}
        >
          {carregando ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",

                  fontFamily: "Inter",
                  color: "#FFFFFF",
                }}
              >
                Entrar
              </Text>

              <ArrowRightIcon
                size={23}
                color="#FFFFFF"
                weight="bold"
                style={{
                  position: "absolute",
                  right: 16,
                }}
              />
            </>
          )}
        </Pressable>

        {/* GOOGLE - SOMENTE NATIVO */}

        {Platform.OS !== "web" && (
          <>
            {/* DIVISOR */}

            <View
              style={{
                marginTop: 30,
                marginBottom: 22,

                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: cores.border,
                }}
              />

              <Text
                style={{
                  marginHorizontal: 12,

                  fontSize: 13,

                  fontFamily: "Anuphan",
                  color: cores.textSecondary,
                }}
              >
                ou continue com
              </Text>

              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: cores.border,
                }}
              />
            </View>

            {/* BOTÃO GOOGLE */}

            <Pressable
              onPress={entrarComGoogle}
              style={({ pressed }) => ({
                height: 54,

                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: 12,
                borderWidth: 1,
                borderColor: cores.border,

                backgroundColor: cores.surface,

                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 15,

                  fontFamily: "Anuphan",
                  color: cores.text,
                }}
              >
                Entrar com sua conta Google
              </Text>
            </Pressable>
          </>
        )}

        {/* CADASTRO */}

        <View
          style={{
            marginTop: 26,

            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,

              fontFamily: "Anuphan",
              color: cores.textSecondary,
            }}
          >
            Ainda não tem uma conta?{" "}
          </Text>

          <Pressable
            onPress={() => navigation.navigate("Cadastro")}
            style={{
              ...(Platform.OS === "web"
                ? {
                      cursor: "pointer",
                    }
                : {}),
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",

                fontFamily: "Anuphan",
                color: "#39FF14",
              }}
            >
              Cadastre-se
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ==================================================
  // TELA
  // ==================================================

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: cores.background,
      }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === "android" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            flexGrow: 1,

            ...(desktop
              ? {
                    minHeight: "100%",
                    justifyContent: "center",
                    paddingVertical: 50,
                    paddingHorizontal: 35,
                  }
              : {
                    paddingHorizontal: 24,
                    paddingTop: 25,
                    paddingBottom: 35,
                  }),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ============================================ */}
          {/* CONTAINER PRINCIPAL                         */}
          {/* ============================================ */}

          <View
            style={{
              width: "100%",

              ...(desktop
                ? {
                      maxWidth: 1250,
                      alignSelf: "center",

                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",

                      minHeight: 650,
                    }
                : {
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                    }),
            }}
          >
            {/* ======================================== */}
            {/* LADO ESQUERDO - MARCA                  */}
            {/* ======================================== */}

            <View
              style={{
                ...(desktop
                  ? {
                        flex: 1,
                        alignSelf: "stretch",
                        justifyContent: "center",
                      }
                  : {
                        width: "100%",
                        alignItems: "center",
                      }),
              }}
            >
              <PainelMarca />
            </View>

            {/* ======================================== */}
            {/* LADO DIREITO - LOGIN                   */}
            {/* ======================================== */}

            <View
              style={{
                width: "100%",

                ...(desktop
                  ? {
                        maxWidth: 480,
                        width: "44%",
                        padding: 36,

                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: cores.border,

                        backgroundColor: cores.surface,

                        shadowColor: "#000000",
                        shadowOffset: {
                          width: 0,
                          height: 12,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 25,
                        elevation: 10,

                        ...(Platform.OS === "web"
                          ? {
                                boxShadow:
                                  "0px 15px 45px rgba(0,0,0,0.20)",
                            }
                          : {}),
                    }
                  : {
                        maxWidth: 480,
                        alignSelf: "center",
                        paddingTop: 25,
                        paddingBottom: 10,
                      }),
              }}
            >
              <FormularioLogin />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* POP-UP PERSONALIZADO */}

      <ModalAlerta
        visible={alerta.visible}
        titulo={alerta.titulo}
        mensagem={alerta.mensagem}
        tipo={alerta.tipo}
        onClose={fecharAlerta}
      />
    </View>
  );
}