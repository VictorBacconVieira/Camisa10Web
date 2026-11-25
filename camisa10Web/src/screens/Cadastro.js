import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
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

import { SafeAreaView } from "react-native-safe-area-context";

import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  LockIcon,
  WarningCircleIcon,
  XIcon,
  UserIcon,
  SoccerBallIcon,
} from "phosphor-react-native";

import { useNavigation } from "@react-navigation/native";

import Input from "../components/input";
import Checkbox from "../components/checkbox";
import PasswordRequirement from "../components/passwordRequirement";
import { FotoPerfil } from "../components/fotoPerfil";

import {
  cadastrarUsuario,
  atualizarFotoPerfil,
} from "../services/authService";

// =============================================================
// MODAL PERSONALIZADO
// =============================================================


// =============================================================
// MODAL PERSONALIZADO - WEB + MOBILE
// =============================================================

function ModalAlerta({ visible, tipo, titulo, mensagem, onClose }) {
  const opacidade = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.9)).current;
  const deslocamento = useRef(new Animated.Value(20)).current;

  // O driver nativo não é utilizado no navegador.
  const nativeDriver = Platform.OS !== "web";

  const configuracoes = {
    erro: {
      cor: "#E53935",
      Icone: WarningCircleIcon,
      botao: "Entendi",
    },
    sucesso: {
      cor: "#00C853",
      Icone: CheckCircleIcon,
      botao: "Continuar",
    },
    aviso: {
      cor: "#FFC107",
      Icone: InfoIcon,
      botao: "Entendi",
    },
  };

  const atual = configuracoes[tipo] || configuracoes.aviso;
  const Icone = atual.Icone;

  useEffect(() => {
    if (visible) {
      opacidade.setValue(0);
      escala.setValue(0.9);
      deslocamento.setValue(20);

      Animated.parallel([
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: nativeDriver,
        }),

        Animated.spring(escala, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: nativeDriver,
        }),

        Animated.timing(deslocamento, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: nativeDriver,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* OVERLAY */}

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,

          width: "100%",
          height: "100%",

          alignItems: "center",
          justifyContent: "center",

          paddingHorizontal: 24,

          backgroundColor: "rgba(0,0,0,0.72)",
          opacity: opacidade,

          zIndex: 9999,
        }}
      >
        {/* CARD DO ALERTA */}

        <Animated.View
          style={{
            width: "100%",
            maxWidth: 440,

            backgroundColor: "#16232D",

            borderWidth: 1,
            borderColor: "#26343E",
            borderRadius: 24,

            overflow: "hidden",

            opacity: opacidade,

            transform: [
              { scale: escala },
              { translateY: deslocamento },
            ],

            ...(Platform.OS === "web"
              ? {
                  boxShadow: "0px 20px 60px rgba(0,0,0,0.45)",
                }
              : {
                  elevation: 15,
                  shadowColor: "#000000",
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  shadowOffset: {
                    width: 0,
                    height: 10,
                  },
                }),
          }}
        >
          {/* BARRA SUPERIOR COLORIDA */}

          <View
            style={{
              height: 4,
              width: "100%",
              backgroundColor: atual.cor,
            }}
          />

          {/* CONTEÚDO */}

          <View style={{ padding: 24 }}>
            {/* ÍCONE E BOTÃO FECHAR */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,

                  alignItems: "center",
                  justifyContent: "center",

                  backgroundColor: `${atual.cor}20`,
                }}
              >
                <Icone
                  size={32}
                  color={atual.cor}
                  weight="bold"
                />
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  backgroundColor: "#26343E",
                  cursor: Platform.OS === "web" ? "pointer" : undefined,
                }}
              >
                <XIcon size={20} color="#A8B2B9" />
              </Pressable>
            </View>

            {/* TÍTULO */}

            <Text
              style={{
                color: "#F5F7F8",
                fontFamily: "Anuphan",
                fontSize: 21,
                fontWeight: "800",
                marginBottom: 9,
              }}
            >
              {titulo}
            </Text>

            {/* MENSAGEM */}

            <Text
              style={{
                color: "#A8B2B9",
                fontFamily: "Anuphan",
                fontSize: 14,
                lineHeight: 23,
              }}
            >
              {mensagem}
            </Text>

            {/* BOTÃO */}

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: "100%",
                height: 48,

                marginTop: 25,

                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",

                backgroundColor: atual.cor,
                borderRadius: 12,

                opacity: pressed ? 0.85 : 1,

                cursor: Platform.OS === "web" ? "pointer" : undefined,

                ...(Platform.OS === "web"
                  ? {
                      transition: "opacity 150ms ease",
                    }
                  : {}),
              })}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter",
                  fontSize: 15,
                  fontWeight: "800",
                }}
              >
                {atual.botao}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}


// =============================================================
// PAINEL INSTITUCIONAL WEB
// =============================================================

function PainelCadastroWeb() {
  return (
    <View
      style={{
        flex: 1,
        minHeight: "100%",
        backgroundColor: "#09151D",
        paddingHorizontal: 55,
        paddingVertical: 45,
        justifyContent: "space-between",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* DETALHES DECORATIVOS */}

      <View
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: 200,
          borderWidth: 1,
          borderColor: "rgba(57,255,20,0.08)",
          right: -180,
          top: -130,
        }}
      />

      <View
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: 140,
          borderWidth: 1,
          borderColor: "rgba(57,255,20,0.06)",
          right: -100,
          top: -70,
        }}
      />

      <View
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: 225,
          backgroundColor: "rgba(0,200,83,0.035)",
          bottom: -220,
          left: -150,
        }}
      />

      {/* LOGO E MARCA */}

      <View style={{ zIndex: 1 }}>
        <View className="flex-row items-center">
          <View
            className="mr-4 h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "#00C853",
              shadowColor: "#00C853",
              shadowOpacity: 0.25,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 5 },
            }}
          >
            <SoccerBallIcon
              size={34}
              color="#071018"
              weight="fill"
            />
          </View>

          <View>
            <Text
              style={{
                color: "#F5F7F8",
                fontFamily: "Anuphan",
                fontSize: 30,
                fontWeight: "800",
                letterSpacing: -1,
              }}
            >
              Camisa
              <Text style={{ color: "#00C853" }}>10</Text>
            </Text>

            <Text
              style={{
                color: "#6F7B83",
                fontFamily: "Inter",
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 3,
              }}
            >
              SEU FUTEBOL, SEU UNIVERSO
            </Text>
          </View>
        </View>
      </View>

      {/* CONTEÚDO CENTRAL */}

      <View style={{ maxWidth: 600, zIndex: 1, marginVertical: 50 }}>
        <View
          className="mb-5 self-start rounded-full px-4 py-2"
          style={{
            backgroundColor: "rgba(0,200,83,0.10)",
            borderWidth: 1,
            borderColor: "rgba(0,200,83,0.20)",
          }}
        >
          <Text
            style={{
              color: "#39FF14",
              fontFamily: "Inter",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
            }}
          >
            SUA JORNADA COMEÇA AQUI
          </Text>
        </View>

        <Text
          style={{
            color: "#F5F7F8",
            fontFamily: "Anuphan",
            fontSize: 48,
            fontWeight: "800",
            lineHeight: 58,
            letterSpacing: -1.5,
          }}
        >
          Seu jogo.
        </Text>

        <Text
          style={{
            color: "#39FF14",
            fontFamily: "Anuphan",
            fontSize: 48,
            fontWeight: "800",
            lineHeight: 58,
            letterSpacing: -1.5,
          }}
        >
          Sua história.
        </Text>

        <Text
          style={{
            color: "#F5F7F8",
            fontFamily: "Anuphan",
            fontSize: 48,
            fontWeight: "800",
            lineHeight: 58,
            letterSpacing: -1.5,
          }}
        >
          Seu lugar em campo.
        </Text>

        <View
          style={{
            width: 65,
            height: 4,
            backgroundColor: "#00C853",
            borderRadius: 5,
            marginTop: 28,
            marginBottom: 25,
          }}
        />

        <Text
          style={{
            color: "#A8B2B9",
            fontFamily: "Anuphan",
            fontSize: 17,
            lineHeight: 29,
            maxWidth: 440,
          }}
        >
          Entre para o Camisa10 e acompanhe o futebol de um jeito diferente.
          Faça parte de uma experiência feita para quem vive esse esporte.
        </Text>

        {/* CARD INSTITUCIONAL */}

        <View
          className="mt-10 flex-row items-center rounded-2xl p-5"
          style={{
            backgroundColor: "#111D27",
            borderWidth: 1,
            borderColor: "#26343E",
            maxWidth: 430,
          }}
        >
          <View
            className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(0,200,83,0.12)" }}
          >
            <UserIcon size={25} color="#39FF14" weight="bold" />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#F5F7F8",
                fontFamily: "Anuphan",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Crie sua conta
            </Text>

            <Text
              style={{
                color: "#A8B2B9",
                fontFamily: "Anuphan",
                fontSize: 12,
                lineHeight: 19,
                marginTop: 4,
              }}
            >
              Personalize seu perfil e acompanhe o universo do futebol.
            </Text>
          </View>
        </View>
      </View>

      {/* RODAPÉ */}

      <View style={{ zIndex: 1 }}>
        <View
          style={{
            height: 1,
            backgroundColor: "#26343E",
            marginBottom: 18,
          }}
        />

        <Text
          style={{
            color: "#6F7B83",
            fontFamily: "Inter",
            fontSize: 11,
          }}
        >
          © Camisa10 — Feito para quem vive futebol.
        </Text>
      </View>
    </View>
  );
}

// =============================================================
// TELA DE CADASTRO
// =============================================================

export function Cadastro() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Identifica quando estamos em um layout desktop.
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width >= 900;

  // ===========================================================
  // ESTADOS
  // ===========================================================

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [termos, setTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [fotoCarregando, setFotoCarregando] = useState(false);

  const [alerta, setAlerta] = useState({
    visivel: false,
    tipo: "aviso",
    titulo: "",
    mensagem: "",
  });

  const acaoAlertaRef = useRef(null);

  // ===========================================================
  // REFERÊNCIAS DOS CAMPOS E DA ROLAGEM
  // ===========================================================

  const scrollRef = useRef(null);

  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const dataRef = useRef(null);
  const senhaRef = useRef(null);
  const confirmacaoRef = useRef(null);

  const posicoesCampos = useRef({});

  // ===========================================================
  // ALERTAS
  // ===========================================================

  function mostrarAlerta(tipo, titulo, mensagem, acao = null) {
    acaoAlertaRef.current = acao;

    setAlerta({
      visivel: true,
      tipo,
      titulo,
      mensagem,
    });
  }

  function fecharAlerta() {
    setAlerta((atual) => ({
      ...atual,
      visivel: false,
    }));

    const acao = acaoAlertaRef.current;
    acaoAlertaRef.current = null;

    if (acao) {
      setTimeout(() => acao(), 250);
    }
  }

  // ===========================================================
  // REDIRECIONAMENTO PARA O CAMPO
  // ===========================================================

  function focarCampo(nomeCampo, referencia) {
    const posicao = posicoesCampos.current[nomeCampo];

    if (posicao !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: Math.max(0, posicao - 30),
        animated: true,
      });
    }

    // Aguarda a rolagem antes de abrir o teclado.
    setTimeout(() => {
      referencia?.current?.focus?.();
    }, 350);
  }

  function registrarPosicao(nomeCampo, evento) {
    posicoesCampos.current[nomeCampo] = evento.nativeEvent.layout.y;
  }

  function campoObrigatorioVazio() {
    if (!nome.trim()) {
      return {
        campo: "nome",
        referencia: nomeRef,
        titulo: "Nome não informado",
        mensagem: "Preencha seu nome completo para continuar.",
      };
    }

    if (!email.trim()) {
      return {
        campo: "email",
        referencia: emailRef,
        titulo: "E-mail não informado",
        mensagem: "Informe seu endereço de e-mail para continuar.",
      };
    }

    if (!dataNascimento.trim()) {
      return {
        campo: "data",
        referencia: dataRef,
        titulo: "Data não informada",
        mensagem: "Informe sua data de nascimento.",
      };
    }

    if (!senha) {
      return {
        campo: "senha",
        referencia: senhaRef,
        titulo: "Senha não informada",
        mensagem: "Crie uma senha para sua conta.",
      };
    }

    if (!confirmacao) {
      return {
        campo: "confirmacao",
        referencia: confirmacaoRef,
        titulo: "Confirmação não informada",
        mensagem: "Confirme sua senha para continuar.",
      };
    }

    return null;
  }

  // ===========================================================
  // REQUISITOS DA SENHA
  // ===========================================================

  const senhaTem8Caracteres = senha.length >= 8;
  const senhaTemMaiuscula = /[A-Z]/.test(senha);
  const senhaTemNumero = /\d/.test(senha);

  const senhasIguais =
    senha.length > 0 && confirmacao.length > 0 && senha === confirmacao;

  // ===========================================================
  // FORMATAÇÃO DA DATA
  // ===========================================================

  function formatarDataNascimento(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  }

  // ===========================================================
  // VALIDAÇÃO DA DATA
  // ===========================================================

  function validarDataNascimento(valor) {
    const formato = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const resultado = valor.match(formato);

    if (!resultado) return "formato";

    const dia = Number(resultado[1]);
    const mes = Number(resultado[2]);
    const ano = Number(resultado[3]);

    if (ano < 1900) return "ano_antigo";

    const data = new Date(ano, mes - 1, dia);

    const dataExiste =
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia;

    if (!dataExiste) return "data_invalida";

    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    if (data > hoje) return "futura";

    return null;
  }

  // ===========================================================
  // VALIDAÇÃO DE E-MAIL
  // ===========================================================

  function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
  }

  const nomeValido = (valor) =>
    /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u.test(valor.trim());

  // ===========================================================
  // BACKEND - PONTO DE INTEGRAÇÃO FUTURA
  // ===========================================================

  async function enviarCadastro() {
    const dataNascimentoISO = dataNascimento.split("/").reverse().join("-");

    const resultado = await cadastrarUsuario({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senha,
      data_nascimento: dataNascimentoISO,
    });

    return resultado;
  }

  // ===========================================================
  // FUNÇÃO PRINCIPAL DE CADASTRO
  // ===========================================================

  async function cadastrar() {
    if (carregando) return;

    Keyboard.dismiss();

    // Verifica o primeiro campo obrigatório vazio.
    const campoVazio = campoObrigatorioVazio();

    if (campoVazio) {
      mostrarAlerta(
        "aviso",
        campoVazio.titulo,
        campoVazio.mensagem,
        () => focarCampo(campoVazio.campo, campoVazio.referencia),
      );
      return;
    }

    if (!nomeValido(nome)) {
      mostrarAlerta(
        "erro",
        "Nome inválido",
        "Informe um nome válido, utilizando apenas letras, espaços, hífens ou apóstrofos.",
        () => focarCampo("nome", nomeRef),
      );
      return;
    }

    if (!emailValido(email)) {
      mostrarAlerta(
        "erro",
        "E-mail inválido",
        "Informe um endereço de e-mail válido. Exemplo: usuario@gmail.com.",
        () => focarCampo("email", emailRef),
      );
      return;
    }

    const erroData = validarDataNascimento(dataNascimento);

    if (erroData === "formato") {
      mostrarAlerta(
        "erro",
        "Data incompleta",
        "Informe a data de nascimento completa no formato DD/MM/AAAA.",
        () => focarCampo("data", dataRef),
      );
      return;
    }

    if (erroData === "ano_antigo") {
      mostrarAlerta(
        "erro",
        "Ano inválido",
        "O ano de nascimento deve ser 1900 ou posterior. Verifique a data informada.",
        () => focarCampo("data", dataRef),
      );
      return;
    }

    if (erroData === "data_invalida") {
      mostrarAlerta(
        "erro",
        "Data inválida",
        "Essa data não existe. Verifique o dia e o mês informados.",
        () => focarCampo("data", dataRef),
      );
      return;
    }

    if (erroData === "futura") {
      mostrarAlerta(
        "erro",
        "Data futura",
        "A data de nascimento não pode ser posterior à data atual.",
        () => focarCampo("data", dataRef),
      );
      return;
    }

    if (!senhaTem8Caracteres) {
      mostrarAlerta(
        "aviso",
        "Senha muito curta",
        "Sua senha precisa ter pelo menos 8 caracteres.",
        () => focarCampo("senha", senhaRef),
      );
      return;
    }

    if (!senhaTemMaiuscula) {
      mostrarAlerta(
        "aviso",
        "Senha incompleta",
        "Sua senha precisa ter pelo menos uma letra maiúscula.",
        () => focarCampo("senha", senhaRef),
      );
      return;
    }

    if (!senhaTemNumero) {
      mostrarAlerta(
        "aviso",
        "Senha incompleta",
        "Sua senha precisa ter pelo menos um número.",
        () => focarCampo("senha", senhaRef),
      );
      return;
    }

    if (senha !== confirmacao) {
      mostrarAlerta(
        "erro",
        "Senhas diferentes",
        "A senha e a confirmação precisam ser iguais.",
        () => focarCampo("confirmacao", confirmacaoRef),
      );
      return;
    }

    if (!termos) {
      mostrarAlerta(
        "aviso",
        "Termos de Uso",
        "É necessário aceitar os Termos de Uso e a Política de Privacidade para continuar.",
      );
      return;
    }

    try {
      setCarregando(true);

      const resultado = await enviarCadastro();

      if (resultado?.access_token) {
        let mensagem =
          "Seu cadastro foi realizado com sucesso. Bem-vindo ao Camisa10!";

        if (fotoPerfil) {
          try {
            setFotoCarregando(true);

            await atualizarFotoPerfil(fotoPerfil);

            mensagem += "\n\nSua foto de perfil também foi cadastrada!";
          } catch (erroFoto) {
            console.error("ERRO AO ENVIAR FOTO:", erroFoto);

            mensagem +=
              "\n\nNão foi possível enviar sua foto. Você poderá adicioná-la depois no perfil.";
          } finally {
            setFotoCarregando(false);
          }
        }

        mostrarAlerta(
          "sucesso",
          "Conta criada!",
          mensagem,
          () => navigation.navigate("Login"),
        );
      } else {
        mostrarAlerta(
          "aviso",
          "Cadastro realizado",
          "Sua conta foi cadastrada, mas não recebemos um token de autenticação. Faça login para continuar.",
          () => navigation.navigate("Login"),
        );
      }
    } catch (error) {
      const mensagem = error.message || "";

      if (mensagem.toLowerCase().includes("já está cadastrado")) {
        mostrarAlerta(
          "aviso",
          "E-mail já cadastrado",
          "Este endereço de e-mail já possui uma conta. Utilize outro e-mail ou faça login.",
        );
      } else {
        console.error("ERRO NO CADASTRO:", error);

        mostrarAlerta(
          "erro",
          "Erro no cadastro",
          mensagem || "Não foi possível concluir o cadastro. Tente novamente.",
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  // ===========================================================
  // INTERFACE
  // ===========================================================

  return (
    <SafeAreaView
      className="flex-1 bg-fundo"
      edges={["top", "bottom"]}
      style={
        isDesktop
          ? {
              flexDirection: "row",
              backgroundColor: "#071018",
            }
          : undefined
      }
    >
      {/* ===================================================== */}
      {/* PAINEL ESQUERDO - WEB DESKTOP                         */}
      {/* ===================================================== */}

      {isDesktop && (
        <View
          style={{
            flex: 1,
            minHeight: "100%",
          }}
        >
          <PainelCadastroWeb />
        </View>
      )}

      {/* ===================================================== */}
      {/* PAINEL DIREITO - FORMULÁRIO                           */}
      {/* ===================================================== */}

      <View
        style={
          isDesktop
            ? {
                width: "52%",
                maxWidth: 900,
                minHeight: "100%",
                backgroundColor: "#071018",
                justifyContent: "center",
              }
            : {
                flex: 1,
              }
        }
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "android" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: isDesktop ? 55 : 20,
              paddingTop: isDesktop ? 35 : 20,
              paddingBottom: 40,
              flexGrow: isDesktop ? 1 : undefined,
              justifyContent: isDesktop ? "center" : undefined,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* CONTAINER DO FORMULÁRIO DESKTOP */}

            <View
              style={{
                width: "100%",
                maxWidth: isDesktop ? 520 : undefined,
                alignSelf: isDesktop ? "center" : undefined,
              }}
            >
              {/* CABEÇALHO */}

              <View className="mb-6 flex-row items-center">
                <Pressable
                  onPress={() => navigation.goBack()}
                  className="mr-4 p-2"
                  hitSlop={8}
                  style={
                    isDesktop
                      ? {
                          borderWidth: 1,
                          borderColor: "#26343E",
                          borderRadius: 12,
                          backgroundColor: "#111D27",
                        }
                      : undefined
                  }
                >
                  <ArrowLeftIcon size={26} color="#F5F7F8" weight="bold" />
                </Pressable>

                <Text
                  className="text-xl text-texto"
                  style={{ fontFamily: "Anuphan" }}
                >
                  Cadastro
                </Text>
              </View>

              {/* TÍTULO */}

              <Text
                className="text-3xl font-bold text-texto"
                style={{ fontFamily: "Anuphan" }}
              >
                Criar <Text className="text-verde">Conta</Text>
              </Text>

              <Text
                className="mt-2 text-sm leading-5 text-texto-sec"
                style={{
                  fontFamily: "Anuphan",
                  maxWidth: 440,
                }}
              >
                Preencha os campos com os dados correspondentes para criar sua
                conta.
              </Text>

              {/* FOTO DE PERFIL */}

              <View className="my-7 items-center">
                <FotoPerfil
                  foto={fotoPerfil}
                  nome={nome || "Novo usuário"}
                  tamanho={96}
                  onFotoSelecionada={(uri) => {
                    setFotoPerfil(uri);

                    // FUTURO BACKEND:
                    // Enviar a imagem para a API e associá-la
                    // ao usuário após a criação da conta.
                  }}
                />

                {isDesktop && (
                  <Text
                    style={{
                      fontFamily: "Anuphan",
                      fontSize: 12,
                      color: "#6F7B83",
                      marginTop: 10,
                    }}
                  >
                    Adicione uma foto de perfil (opcional)
                  </Text>
                )}
              </View>

              {/* NOME COMPLETO */}

              <View
                className="mb-4"
                onLayout={(event) => registrarPosicao("nome", event)}
              >
                <Text
                  className="mb-2 text-base text-texto"
                  style={{ fontFamily: "Anuphan" }}
                >
                  Nome completo
                </Text>

                <Input
                  ref={nomeRef}
                  icon={UserIcon}
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => focarCampo("email", emailRef)}
                />
              </View>

              {/* E-MAIL */}

              <View
                className="mb-4"
                onLayout={(event) => registrarPosicao("email", event)}
              >
                <Text
                  className="mb-2 text-base text-texto"
                  style={{ fontFamily: "Anuphan" }}
                >
                  E-mail
                </Text>

                <Input
                  ref={emailRef}
                  icon={EnvelopeIcon}
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => focarCampo("data", dataRef)}
                />
              </View>

              {/* DATA DE NASCIMENTO */}

              <View
                className="mb-4"
                onLayout={(event) => registrarPosicao("data", event)}
              >
                <Text
                  className="mb-2 text-base text-texto"
                  style={{ fontFamily: "Anuphan" }}
                >
                  Data de nascimento
                </Text>

                <Input
                  ref={dataRef}
                  icon={CalendarBlankIcon}
                  placeholder="DD/MM/AAAA"
                  value={dataNascimento}
                  onChangeText={(valor) =>
                    setDataNascimento(formatarDataNascimento(valor))
                  }
                  keyboardType="numeric"
                  autoCapitalize="none"
                  maxLength={10}
                  returnKeyType="next"
                  onSubmitEditing={() => focarCampo("senha", senhaRef)}
                />
              </View>

              {/* SENHA */}

              <View
                className="mb-4"
                onLayout={(event) => registrarPosicao("senha", event)}
              >
                <Text
                  className="mb-2 text-base text-texto"
                  style={{ fontFamily: "Anuphan" }}
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
                  rightIcon={mostrarSenha ? EyeSlashIcon : EyeIcon}
                  onRightIconPress={() => setMostrarSenha(!mostrarSenha)}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    focarCampo("confirmacao", confirmacaoRef)
                  }
                />

                <View className="mt-2">
                  <PasswordRequirement valid={senhaTem8Caracteres}>
                    Mínimo de 8 caracteres
                  </PasswordRequirement>

                  <PasswordRequirement valid={senhaTemMaiuscula}>
                    Pelo menos uma letra maiúscula
                  </PasswordRequirement>

                  <PasswordRequirement valid={senhaTemNumero}>
                    Pelo menos um número
                  </PasswordRequirement>
                </View>
              </View>

              {/* CONFIRMAR SENHA */}

              <View
                className="mb-5"
                onLayout={(event) => registrarPosicao("confirmacao", event)}
              >
                <Text
                  className="mb-2 text-base text-texto"
                  style={{ fontFamily: "Anuphan" }}
                >
                  Confirmar senha
                </Text>

                <Input
                  ref={confirmacaoRef}
                  icon={LockIcon}
                  placeholder="Confirme sua senha"
                  value={confirmacao}
                  onChangeText={setConfirmacao}
                  secureTextEntry={!mostrarConfirmacao}
                  rightIcon={mostrarConfirmacao ? EyeSlashIcon : EyeIcon}
                  onRightIconPress={() =>
                    setMostrarConfirmacao(!mostrarConfirmacao)
                  }
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                <View className="mt-2">
                  <PasswordRequirement valid={senhasIguais}>
                    As senhas devem ser iguais
                  </PasswordRequirement>
                </View>
              </View>

              {/* TERMOS DE USO */}

              <View className="mb-6">
                <Checkbox
                  checked={termos}
                  onPress={() => setTermos(!termos)}
                >
                  Li e concordo com os Termos de Uso e Política de Privacidade.
                </Checkbox>
              </View>

              {/* BOTÃO CADASTRAR */}

              <Pressable
                onPress={cadastrar}
                disabled={carregando || fotoCarregando}
                className="h-12 flex-row items-center justify-center rounded-xl bg-verde"
                style={{
                  opacity: carregando || fotoCarregando ? 0.7 : 1,
                  ...(isDesktop
                    ? {
                        shadowColor: "#00C853",
                        shadowOpacity: 0.14,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 4 },
                      }
                    : {}),
              }}
              >
                {carregando || fotoCarregando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    className="text-base font-bold text-texto"
                    style={{ fontFamily: "Inter" }}
                  >
                    Cadastrar
                  </Text>
                )}
              </Pressable>

              {/* VOLTAR PARA LOGIN */}

              <View className="mt-6 flex-row justify-center">
                <Text
                  className="text-sm text-texto-sec"
                  style={{ fontFamily: "Anuphan" }}
                >
                  Já tem uma conta?{" "}
                </Text>

                <Pressable onPress={() => navigation.navigate("Login")}>
                  <Text
                    className="text-sm font-bold text-verde"
                    style={{ fontFamily: "Anuphan" }}
                  >
                    Faça Login
                  </Text>
                </Pressable>
              </View>

              {/* RODAPÉ DESKTOP */}

              {isDesktop && (
                <View className="mt-8 items-center">
                  <Text
                    style={{
                      color: "#52616B",
                      fontFamily: "Inter",
                      fontSize: 11,
                    }}
                  >
                    Ao criar sua conta, você passa a fazer parte do Camisa10.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* ===================================================== */}
      {/* MODAL DE ALERTA                                        */}
      {/* ===================================================== */}

      <ModalAlerta
        visible={alerta.visivel}
        tipo={alerta.tipo}
        titulo={alerta.titulo}
        mensagem={alerta.mensagem}
        onClose={fecharAlerta}
      />
    </SafeAreaView>
  );
}