import { useState, useEffect } from "react";

import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
} from "react-native";

import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  TrashIcon,
  XIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  UserCircleIcon,
  EnvelopeSimpleIcon,
  ShieldCheckIcon,
  FloppyDiskIcon,
  CameraIcon,
  PencilSimpleIcon,
  CaretRightIcon,
} from "phosphor-react-native";

import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SideBar } from "../components/sideBar";
import { FotoPerfil } from "../components/fotoPerfil";
import { CalendarioPersonalizado } from "../components/calendarioPersonalizado";
import { Texto } from "../components/texto";

import { useAccessibility } from "../context/AccessibilityContext";
import { useAuth } from "../context/AuthContext";

import {
  atualizarFotoPerfil,
  alterarSenha as alterarSenhaAPI,
  excluirConta as excluirContaAPI,
} from "../services/authService";

import { useTheme } from "../context/ThemeContext";

// =====================================================
// COMPONENTE: CAMPO DE TEXTO
// =====================================================

function Campo({
  label,
  valor,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  Icon,
}) {
  const { cores } = useTheme();
  const { fontScale, configuracoes } = useAccessibility();

  const escalaIcone =
    configuracoes.tamanhoTexto === "grande"
      ? 1.15
      : configuracoes.tamanhoTexto === "muitoGrande"
        ? 1.3
        : 1;

  return (
    <View style={{ marginBottom: 20, flex: 1 }}>
      <Texto
        tamanho={13}
        style={{
          color: cores.textSecondary,
          marginBottom: 9,
          fontWeight: "700",
        }}
      >
        {label}
      </Texto>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: cores.surface,
          borderWidth: 1,
          borderColor: cores.border,
          borderRadius: 13,
          paddingHorizontal: 14,
          minHeight: 54,
        }}
      >
        {Icon && (
          <Icon
            size={20 * escalaIcone}
            color={cores.textSecondary}
          />
        )}

        <TextInput
          value={valor}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={cores.textTertiary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            color: cores.text,
            fontSize: 14 * fontScale,
            paddingVertical: 14,
            marginLeft: Icon ? 10 : 0,
            minHeight: 52,
            outlineStyle: "none",
          }}
        />
      </View>
    </View>
  );
}

// =====================================================
// COMPONENTE: CAMPO DE SENHA
// =====================================================

function CampoSenha({
  label,
  valor,
  onChangeText,
  mostrar,
  alternarVisibilidade,
  placeholder,
}) {
  const { cores } = useTheme();
  const { fontScale, configuracoes } = useAccessibility();

  const escalaIcone =
    configuracoes.tamanhoTexto === "grande"
      ? 1.15
      : configuracoes.tamanhoTexto === "muitoGrande"
        ? 1.3
        : 1;

  return (
    <View style={{ marginBottom: 17 }}>
      <Texto
        tamanho={13}
        style={{
          color: cores.textSecondary,
          marginBottom: 8,
          fontWeight: "700",
        }}
      >
        {label}
      </Texto>

      <View
        style={{
          backgroundColor: cores.surface,
          borderWidth: 1,
          borderColor: cores.border,
          borderRadius: 13,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          minHeight: 52,
        }}
      >
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={cores.textTertiary}
          secureTextEntry={!mostrar}
          autoCapitalize="none"
          style={{
            flex: 1,
            color: cores.text,
            paddingVertical: 14,
            fontSize: 14 * fontScale,
            minHeight: 50,
            outlineStyle: "none",
          }}
        />

        <Pressable
          onPress={alternarVisibilidade}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            mostrar ? "Ocultar senha" : "Mostrar senha"
          }
          style={{ padding: 4 }}
        >
          {mostrar ? (
            <EyeSlashIcon
              size={21 * escalaIcone}
              color={cores.icon}
            />
          ) : (
            <EyeIcon
              size={21 * escalaIcone}
              color={cores.icon}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

// =====================================================
// COMPONENTE: TÍTULO DE SEÇÃO
// =====================================================

function TituloSecao({
  Icon,
  titulo,
  descricao,
  cores,
  escalaIcone,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 22,
      }}
    >
      {Icon && (
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            backgroundColor: cores.surfaceSecondary,
            borderWidth: 1,
            borderColor: cores.border,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon
            size={22 * escalaIcone}
            color={cores.primary}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Texto
          tamanho={18}
          style={{
            color: cores.text,
            fontWeight: "800",
          }}
        >
          {titulo}
        </Texto>

        {descricao && (
          <Texto
            tamanho={12}
            style={{
              color: cores.textSecondary,
              marginTop: 4,
              lineHeight: 17,
            }}
          >
            {descricao}
          </Texto>
        )}
      </View>
    </View>
  );
}

// =====================================================
// COMPONENTE: BOTÃO
// =====================================================

function Botao({
  titulo,
  onPress,
  Icon,
  cor,
  textoCor,
  cores,
  secundario = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: secundario
          ? cores.surfaceSecondary
          : cor || cores.primary,
        borderWidth: secundario ? 1 : 0,
        borderColor: cores.border,
        borderRadius: 13,
        paddingVertical: 15,
        paddingHorizontal: 18,
        minHeight: 52,
        opacity: pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {Icon && (
        <Icon
          size={20}
          color={secundario ? cores.icon : textoCor || cores.background}
          style={{ marginRight: 9 }}
        />
      )}

      <Texto
        tamanho={14}
        style={{
          color: secundario
            ? cores.text
            : textoCor || cores.background,
          fontWeight: "800",
          textAlign: "center",
        }}
      >
        {titulo}
      </Texto>
    </Pressable>
  );
}

// =====================================================
// COMPONENTE: CARD
// IMPORTANTE: FORA DE EDITARPERFIL
// =====================================================

function Card({ children, style = {} }) {
  const { cores } = useTheme();
  const { width } = useWindowDimensions();

  const layoutTablet = width >= 700;

  return (
    <View
      style={{
        backgroundColor: cores.surface,
        borderWidth: 1,
        borderColor: cores.border,
        borderRadius: 20,
        padding: layoutTablet ? 24 : 18,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

// =====================================================
// COMPONENTE: AVISO
// IMPORTANTE: FORA DE EDITARPERFIL
// =====================================================

function Aviso({ mensagem, danger = false }) {
  const { cores } = useTheme();
  const { fontScale } = useAccessibility();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: danger
          ? "rgba(229,57,53,0.10)"
          : "rgba(0,200,83,0.08)",
        borderWidth: 1,
        borderColor: danger
          ? "rgba(229,57,53,0.3)"
          : "rgba(0,200,83,0.25)",
        borderRadius: 13,
        padding: 13,
        marginBottom: 18,
      }}
    >
      <WarningCircleIcon
        size={20}
        color={danger ? cores.danger : cores.primary}
        weight="fill"
      />

      <Texto
        tamanho={12}
        style={{
          color: cores.textSecondary,
          flex: 1,
          marginLeft: 9,
          lineHeight: 18 * fontScale,
        }}
      >
        {mensagem}
      </Texto>
    </View>
  );
}

// =====================================================
// TELA: EDITAR PERFIL
// =====================================================

export function EditarPerfil() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const { cores } = useTheme();
  const { fontScale, configuracoes } = useAccessibility();

  const escalaIcone =
    configuracoes.tamanhoTexto === "grande"
      ? 1.15
      : configuracoes.tamanhoTexto === "muitoGrande"
        ? 1.3
        : 1;

  const layoutTablet = width >= 700;

  const {
    usuario: usuarioAutenticado,
    atualizarDadosUsuario,
    atualizarFotoUsuario,
    sair,
  } = useAuth();

  // =====================================================
  // DADOS DO USUÁRIO
  // =====================================================

  const [usuario, setUsuario] = useState({
    nome: usuarioAutenticado?.nome || "",
    nomeUsuario: usuarioAutenticado?.apelido || "",
    email: usuarioAutenticado?.email || "",
    dataNascimento: usuarioAutenticado?.data_nascimento
      ? new Date(`${usuarioAutenticado.data_nascimento}T12:00:00`)
      : null,
  });

  const [fotoPerfil, setFotoPerfil] = useState(
    usuarioAutenticado?.avatar_url || null
  );

  const [fotoCarregando, setFotoCarregando] = useState(false);

  useEffect(() => {
    if (!usuarioAutenticado) return;

    setUsuario((anterior) => ({
      ...anterior,
      nome: usuarioAutenticado.nome || "",
      nomeUsuario: usuarioAutenticado.apelido || "",
      email: usuarioAutenticado.email || "",
      dataNascimento: usuarioAutenticado.data_nascimento
        ? new Date(`${usuarioAutenticado.data_nascimento}T12:00:00`)
        : null,
    }));

    setFotoPerfil(usuarioAutenticado.avatar_url || null);
  }, [usuarioAutenticado]);

  // =====================================================
  // MODAIS
  // =====================================================

  const [modalSenha, setModalSenha] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // =====================================================
  // ALTERAÇÃO DE SENHA
  // =====================================================

  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenhaAntiga, setMostrarSenhaAntiga] =
    useState(false);

  const [mostrarNovaSenha, setMostrarNovaSenha] =
    useState(false);

  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);

  const [erroSenha, setErroSenha] = useState("");

  // =====================================================
  // EXCLUSÃO DE CONTA
  // =====================================================

  const [senhaExclusao, setSenhaExclusao] = useState("");

  const [mostrarSenhaExclusao, setMostrarSenhaExclusao] =
    useState(false);

  const [confirmacaoExclusao, setConfirmacaoExclusao] =
    useState("");

  const [erroExclusao, setErroExclusao] = useState("");

  // =====================================================
  // CALENDÁRIO
  // =====================================================

  const [mostrarCalendario, setMostrarCalendario] =
    useState(false);

  function formatarData(data) {
    if (!data) return "Selecionar data";

    return data.toLocaleDateString("pt-BR");
  }

  function confirmarData(data) {
    if (data > new Date()) return;

    atualizarCampo("dataNascimento", data);
    setMostrarCalendario(false);
  }

  // =====================================================
  // ATUALIZAÇÃO DOS DADOS
  // =====================================================

  function atualizarCampo(campo, valor) {
    setUsuario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function selecionarFoto(uri) {
    if (fotoCarregando) return;

    try {
      setFotoCarregando(true);

      const resultado = await atualizarFotoPerfil(uri);

      setFotoPerfil(resultado.avatar_url);
      atualizarFotoUsuario(resultado.avatar_url);

      setMensagemSucesso("Foto de perfil atualizada com sucesso!");
      setModalSucesso(true);
    } catch (error) {
      console.log("Erro ao atualizar foto:", error.message);

      setMensagemSucesso(
        error.message || "Não foi possível atualizar sua foto."
      );

      setModalSucesso(true);
    } finally {
      setFotoCarregando(false);
    }
  }

  async function salvarAlteracoes() {
    if (!usuario.nome.trim()) {
      setMensagemSucesso("Informe seu nome completo.");
      setModalSucesso(true);
      return;
    }

    if (!usuario.nomeUsuario.trim()) {
      setMensagemSucesso("Informe seu nome de usuário.");
      setModalSucesso(true);
      return;
    }

    if (!usuario.email.trim()) {
      setMensagemSucesso("Informe seu e-mail.");
      setModalSucesso(true);
      return;
    }

    try {
      const dados = {
        nome: usuario.nome.trim(),
        email: usuario.email.trim(),
        apelido: usuario.nomeUsuario.trim(),
        data_nascimento: usuario.dataNascimento
          ? usuario.dataNascimento.toISOString().split("T")[0]
          : null,
      };

      await atualizarDadosUsuario(dados);

      setMensagemSucesso("Seus dados foram atualizados!");
      setModalSucesso(true);
    } catch (error) {
      console.log("ERRO AO SALVAR PERFIL:", error);

      setMensagemSucesso(
        error.message || "Não foi possível atualizar seus dados."
      );

      setModalSucesso(true);
    }
  }

  // =====================================================
  // ALTERAÇÃO DE SENHA
  // =====================================================

  function abrirModalSenha() {
    setErroSenha("");
    setModalSenha(true);
  }

  function fecharModalSenha() {
    setModalSenha(false);
    setErroSenha("");
    setSenhaAntiga("");
    setNovaSenha("");
    setConfirmarSenha("");
    setMostrarSenhaAntiga(false);
    setMostrarNovaSenha(false);
    setMostrarConfirmarSenha(false);
  }

  async function alterarSenha() {
    setErroSenha("");

    if (!senhaAntiga || !novaSenha || !confirmarSenha) {
      setErroSenha("Preencha todos os campos para continuar.");
      return;
    }

    if (novaSenha.length < 8) {
      setErroSenha("A nova senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErroSenha("A nova senha e a confirmação precisam ser iguais.");
      return;
    }

    if (senhaAntiga === novaSenha) {
      setErroSenha("A nova senha deve ser diferente da senha antiga.");
      return;
    }

    try {
      await alterarSenhaAPI(senhaAntiga, novaSenha);

      fecharModalSenha();
      setMensagemSucesso("Senha alterada com sucesso!");
      setModalSucesso(true);
    } catch (erro) {
      console.error("ERRO AO ALTERAR SENHA:", erro);
      setErroSenha(erro.message || "Não foi possível alterar a senha.");
    }
  }

  // =====================================================
  // EXCLUSÃO DE CONTA
  // =====================================================

  function abrirModalExcluir() {
    setConfirmacaoExclusao("");
    setErroExclusao("");
    setModalExcluir(true);
  }

  function fecharModalExcluir() {
    setModalExcluir(false);
    setConfirmacaoExclusao("");
    setErroExclusao("");
    setSenhaExclusao("");
    setMostrarSenhaExclusao(false);
  }

  async function excluirConta() {
    setErroExclusao("");

    if (confirmacaoExclusao.trim() !== "EXCLUIR") {
      setErroExclusao('Digite exatamente "EXCLUIR" para confirmar.');
      return;
    }

    if (!senhaExclusao) {
      setErroExclusao("Informe sua senha atual para continuar.");
      return;
    }

    try {
      await excluirContaAPI(senhaExclusao);

      fecharModalExcluir();

      await sair();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (erro) {
      setErroExclusao(
        erro.message || "Não foi possível excluir sua conta."
      );
    }
  }

  // =====================================================
  // TELA
  // =====================================================

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{
        backgroundColor: cores.background,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
        }}
      >
        {/* SIDEBAR */}

        <SideBar />

        {/* CONTEÚDO */}

        <ScrollView
          className="flex-1"
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: layoutTablet ? 32 : 18,
            paddingTop: 10,
            paddingBottom: 55,
            maxWidth: 1100,
            width: "100%",
            alignSelf: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* CABEÇALHO */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 13,
                backgroundColor: cores.surface,
                borderWidth: 1,
                borderColor: cores.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
            >
              <ArrowLeftIcon
                size={23 * escalaIcone}
                color={cores.icon}
              />
            </Pressable>

            <View style={{ marginLeft: 15, flex: 1 }}>
              <Texto
                tamanho={25}
                style={{
                  color: cores.text,
                  fontWeight: "800",
                }}
              >
                Editar Perfil
              </Texto>

              <Texto
                tamanho={12}
                style={{
                  color: cores.textSecondary,
                  marginTop: 3,
                }}
              >
                Gerencie suas informações e segurança
              </Texto>
            </View>
          </View>

          {/* CARD DE IDENTIDADE */}

          <Card
            style={{
              marginBottom: 25,
              padding: layoutTablet ? 26 : 18,
            }}
          >
            <View
              style={{
                flexDirection: layoutTablet ? "row" : "column",
                alignItems: layoutTablet ? "center" : "flex-start",
              }}
            >
              {/* FOTO */}

              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: layoutTablet ? 25 : 0,
                  marginBottom: layoutTablet ? 0 : 20,
                }}
              >
                <FotoPerfil
                  foto={fotoPerfil}
                  nome={usuario.nome}
                  tamanho={layoutTablet ? 110 : 95}
                  onFotoSelecionada={selecionarFoto}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: cores.surfaceSecondary,
                    borderWidth: 1,
                    borderColor: cores.border,
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    marginTop: 10,
                  }}
                >
                  <CameraIcon
                    size={14}
                    color={cores.primary}
                  />

                  <Texto
                    tamanho={10}
                    style={{
                      color: cores.textSecondary,
                      marginLeft: 5,
                      fontWeight: "600",
                    }}
                  >
                    Foto de perfil
                  </Texto>
                </View>
              </View>

              {/* INFORMAÇÕES */}

              <View
                style={{
                  flex: 1,
                  width: layoutTablet ? undefined : "100%",
                }}
              >
                <Texto
                  tamanho={layoutTablet ? 22 : 19}
                  style={{
                    color: cores.text,
                    fontWeight: "800",
                  }}
                >
                  {usuario.nome || "Seu perfil"}
                </Texto>

                <Texto
                  tamanho={13}
                  style={{
                    color: cores.textSecondary,
                    marginTop: 5,
                  }}
                >
                  {usuario.nomeUsuario
                    ? `@${usuario.nomeUsuario}`
                    : "Configure seu nome de usuário"}
                </Texto>

                <View
                  style={{
                    backgroundColor: cores.surfaceSecondary,
                    borderRadius: 13,
                    padding: 13,
                    marginTop: 18,
                    borderWidth: 1,
                    borderColor: cores.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <ShieldCheckIcon
                      size={20}
                      color={cores.primary}
                    />

                    <Texto
                      tamanho={12}
                      style={{
                        color: cores.text,
                        fontWeight: "700",
                        marginLeft: 8,
                      }}
                    >
                      Sua conta, suas informações
                    </Texto>
                  </View>

                  <Texto
                    tamanho={11}
                    style={{
                      color: cores.textSecondary,
                      marginTop: 6,
                      lineHeight: 17,
                    }}
                  >
                    Mantenha seus dados atualizados para
                    aproveitar melhor sua experiência no Camisa10.
                  </Texto>
                </View>

                {fotoCarregando && (
                  <Texto
                    tamanho={11}
                    style={{
                      color: cores.primary,
                      marginTop: 12,
                    }}
                  >
                    Atualizando sua foto...
                  </Texto>
                )}
              </View>
            </View>
          </Card>

          {/* INFORMAÇÕES PESSOAIS */}

          <Card style={{ marginBottom: 25 }}>
            <TituloSecao
              Icon={UserCircleIcon}
              titulo="Informações pessoais"
              descricao="Atualize seus dados de identificação"
              cores={cores}
              escalaIcone={escalaIcone}
            />

            <Campo
              label="Nome completo"
              valor={usuario.nome}
              onChangeText={(valor) => atualizarCampo("nome", valor)}
              placeholder="Digite seu nome completo"
              Icon={UserCircleIcon}
            />

            <Campo
              label="Nome de usuário"
              valor={usuario.nomeUsuario}
              onChangeText={(valor) =>
                atualizarCampo("nomeUsuario", valor)
              }
              placeholder="Escolha seu nome de usuário"
              autoCapitalize="none"
              Icon={PencilSimpleIcon}
            />

            <Campo
              label="E-mail"
              valor={usuario.email}
              onChangeText={(valor) => atualizarCampo("email", valor)}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              Icon={EnvelopeSimpleIcon}
            />

            {/* DATA DE NASCIMENTO */}

            <View style={{ marginBottom: 8 }}>
              <Texto
                tamanho={13}
                style={{
                  color: cores.textSecondary,
                  marginBottom: 9,
                  fontWeight: "700",
                }}
              >
                Data de nascimento
              </Texto>

              <Pressable
                onPress={() => setMostrarCalendario(true)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: cores.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: cores.border,
                  borderRadius: 13,
                  paddingHorizontal: 15,
                  minHeight: 54,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <CalendarBlankIcon
                  size={21 * escalaIcone}
                  color={cores.primary}
                />

                <Texto
                  tamanho={14}
                  style={{
                    color: usuario.dataNascimento
                      ? cores.text
                      : cores.textTertiary,
                    flex: 1,
                    marginLeft: 12,
                  }}
                >
                  {formatarData(usuario.dataNascimento)}
                </Texto>

                <CaretRightIcon
                  size={19}
                  color={cores.textSecondary}
                />
              </Pressable>

              <Texto
                tamanho={11}
                style={{
                  color: cores.textTertiary,
                  marginTop: 7,
                }}
              >
                Sua data de nascimento não pode ser futura.
              </Texto>
            </View>
          </Card>

          {/* SALVAR ALTERAÇÕES */}

          <View style={{ marginBottom: 30 }}>
            <Botao
              titulo="Salvar alterações"
              Icon={FloppyDiskIcon}
              onPress={salvarAlteracoes}
              cores={cores}
            />
          </View>

          {/* SEGURANÇA */}

          <Card style={{ marginBottom: 25 }}>
            <TituloSecao
              Icon={ShieldCheckIcon}
              titulo="Segurança"
              descricao="Proteja sua conta e suas informações"
              cores={cores}
              escalaIcone={escalaIcone}
            />

            <View
              style={{
                backgroundColor: cores.surfaceSecondary,
                borderWidth: 1,
                borderColor: cores.border,
                borderRadius: 15,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 13,
                  backgroundColor: cores.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: cores.border,
                }}
              >
                <LockKeyIcon
                  size={23}
                  color={cores.primary}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 13 }}>
                <Texto
                  tamanho={14}
                  style={{
                    color: cores.text,
                    fontWeight: "700",
                  }}
                >
                  Senha da conta
                </Texto>

                <Texto
                  tamanho={11}
                  style={{
                    color: cores.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Altere sua senha periodicamente
                </Texto>
              </View>
            </View>

            <Botao
              titulo="Alterar minha senha"
              Icon={LockKeyIcon}
              onPress={abrirModalSenha}
              cores={cores}
              secundario
            />
          </Card>

          {/* ZONA DE PERIGO */}

          <View
            style={{
              backgroundColor: cores.surface,
              borderWidth: 1,
              borderColor: "rgba(229,57,53,0.45)",
              borderRadius: 20,
              padding: layoutTablet ? 24 : 18,
              marginBottom: 25,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  backgroundColor: "rgba(229,57,53,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <WarningCircleIcon
                  size={24}
                  color={cores.danger}
                  weight="fill"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Texto
                  tamanho={18}
                  style={{
                    color: cores.danger,
                    fontWeight: "800",
                  }}
                >
                  Zona de perigo
                </Texto>

                <Texto
                  tamanho={11}
                  style={{
                    color: cores.textSecondary,
                    marginTop: 3,
                  }}
                >
                  Ações permanentes sobre sua conta
                </Texto>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "rgba(229,57,53,0.07)",
                borderRadius: 13,
                padding: 14,
                marginBottom: 18,
              }}
            >
              <Texto
                tamanho={12}
                style={{
                  color: cores.textSecondary,
                  lineHeight: 19 * fontScale,
                }}
              >
                A exclusão da conta poderá remover permanentemente
                seus dados, conquistas, XP e progresso no Camisa10.
                Essa ação não poderá ser desfeita.
              </Texto>
            </View>

            <Pressable
              onPress={abrirModalExcluir}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(229,57,53,0.10)",
                borderWidth: 1,
                borderColor: cores.danger,
                borderRadius: 13,
                paddingVertical: 15,
                minHeight: 52,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <TrashIcon
                size={20}
                color={cores.danger}
              />

              <Texto
                tamanho={14}
                style={{
                  color: cores.danger,
                  fontWeight: "800",
                  marginLeft: 9,
                }}
              >
                Excluir minha conta
              </Texto>
            </Pressable>
          </View>

          {/* RODAPÉ */}

          <View
            style={{
              alignItems: "center",
              marginTop: 5,
              paddingBottom: 15,
            }}
          >
            <Texto
              tamanho={11}
              style={{
                color: cores.textTertiary,
                textAlign: "center",
              }}
            >
              Camisa10 • Futebol em um só lugar
            </Texto>
          </View>
        </ScrollView>
      </View>

  {/* MODAIS CONTINUAM ABAIXO */}
  // =====================================================
  // MODAL DE ALTERAÇÃO DE SENHA
  // =====================================================

      <Modal
        visible={modalSenha}
        transparent
        animationType="fade"
        onRequestClose={fecharModalSenha}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: cores.overlay,
            justifyContent: "center",
            paddingHorizontal: 22,
          }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: cores.surface,
                borderRadius: 22,
                padding: 23,
                borderWidth: 1,
                borderColor: cores.border,
                width: "100%",
                maxWidth: 500,
                alignSelf: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 43,
                      height: 43,
                      borderRadius: 13,
                      backgroundColor: cores.surfaceSecondary,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <LockKeyIcon
                      size={23}
                      color={cores.primary}
                    />
                  </View>

                  <Texto
                    tamanho={19}
                    style={{
                      color: cores.text,
                      fontWeight: "800",
                    }}
                  >
                    Alterar senha
                  </Texto>
                </View>

                <Pressable
                  onPress={fecharModalSenha}
                  hitSlop={10}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    backgroundColor: cores.surfaceSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <XIcon
                    size={21}
                    color={cores.icon}
                  />
                </Pressable>
              </View>

              <Texto
                tamanho={12}
                style={{
                  color: cores.textSecondary,
                  lineHeight: 19 * fontScale,
                  marginBottom: 22,
                  marginTop: 8,
                }}
              >
                Informe sua senha atual e escolha uma nova
                senha para sua conta.
              </Texto>

              <CampoSenha
                label="Senha antiga"
                valor={senhaAntiga}
                onChangeText={(valor) => {
                  setSenhaAntiga(valor);
                  setErroSenha("");
                }}
                mostrar={mostrarSenhaAntiga}
                alternarVisibilidade={() =>
                  setMostrarSenhaAntiga(!mostrarSenhaAntiga)
                }
                placeholder="Digite sua senha atual"
              />

              <CampoSenha
                label="Nova senha"
                valor={novaSenha}
                onChangeText={(valor) => {
                  setNovaSenha(valor);
                  setErroSenha("");
                }}
                mostrar={mostrarNovaSenha}
                alternarVisibilidade={() =>
                  setMostrarNovaSenha(!mostrarNovaSenha)
                }
                placeholder="Digite sua nova senha"
              />

              <CampoSenha
                label="Confirmar nova senha"
                valor={confirmarSenha}
                onChangeText={(valor) => {
                  setConfirmarSenha(valor);
                  setErroSenha("");
                }}
                mostrar={mostrarConfirmarSenha}
                alternarVisibilidade={() =>
                  setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                }
                placeholder="Repita sua nova senha"
              />

              {!!erroSenha && (
                <Aviso mensagem={erroSenha} danger />
              )}

              <Botao
                titulo="Confirmar alteração"
                Icon={CheckCircleIcon}
                onPress={alterarSenha}
                cores={cores}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* =====================================================
          MODAL DE EXCLUSÃO DE CONTA
      ===================================================== */}

      <Modal
        visible={modalExcluir}
        transparent
        animationType="fade"
        onRequestClose={fecharModalExcluir}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: cores.overlay,
            justifyContent: "center",
            paddingHorizontal: 22,
          }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: cores.surface,
                borderRadius: 22,
                padding: 23,
                borderWidth: 1,
                borderColor: "rgba(229,57,53,0.45)",
                width: "100%",
                maxWidth: 500,
                alignSelf: "center",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 22,
                    backgroundColor: "rgba(229,57,53,0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrashIcon
                    size={35}
                    color={cores.danger}
                  />
                </View>

                <Texto
                  tamanho={20}
                  style={{
                    color: cores.danger,
                    fontWeight: "800",
                    marginTop: 15,
                    textAlign: "center",
                  }}
                >
                  Excluir sua conta?
                </Texto>
              </View>

              <Aviso
                mensagem="Essa ação é permanente. Seus dados, conquistas, XP e progresso poderão ser removidos definitivamente."
                danger
              />

              <Texto
                tamanho={13}
                style={{
                  color: cores.textSecondary,
                  marginBottom: 9,
                  fontWeight: "600",
                }}
              >
                Digite EXCLUIR para confirmar:
              </Texto>

              <TextInput
                value={confirmacaoExclusao}
                onChangeText={(valor) => {
                  setConfirmacaoExclusao(valor);
                  setErroExclusao("");
                }}
                placeholder="Digite EXCLUIR"
                placeholderTextColor={cores.textTertiary}
                autoCapitalize="characters"
                style={{
                  backgroundColor: cores.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: cores.danger,
                  borderRadius: 12,
                  padding: 14,
                  color: cores.text,
                  marginBottom: 18,
                  fontSize: 14 * fontScale,
                  minHeight: 50,
                  outlineStyle: "none",
                }}
              />

              <CampoSenha
                label="Senha atual"
                valor={senhaExclusao}
                onChangeText={(valor) => {
                  setSenhaExclusao(valor);
                  setErroExclusao("");
                }}
                mostrar={mostrarSenhaExclusao}
                alternarVisibilidade={() =>
                  setMostrarSenhaExclusao(!mostrarSenhaExclusao)
                }
                placeholder="Digite sua senha atual"
              />

              {!!erroExclusao && (
                <Aviso mensagem={erroExclusao} danger />
              )}

              <Pressable
                onPress={excluirConta}
                style={({ pressed }) => ({
                  backgroundColor: cores.danger,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  marginBottom: 10,
                  minHeight: 50,
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Texto
                  tamanho={14}
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "800",
                    textAlign: "center",
                  }}
                >
                  Confirmar exclusão permanente
                </Texto>
              </Pressable>

              <Pressable
                onPress={fecharModalExcluir}
                style={({ pressed }) => ({
                  paddingVertical: 13,
                  alignItems: "center",
                  minHeight: 45,
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Texto
                  tamanho={13}
                  style={{
                    color: cores.textSecondary,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  Cancelar e voltar
                </Texto>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* =====================================================
          MODAL DE SUCESSO / FEEDBACK
      ===================================================== */}

      <Modal
        visible={modalSucesso}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSucesso(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: cores.overlay,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 25,
          }}
        >
          <View
            style={{
              backgroundColor: cores.surface,
              borderRadius: 22,
              padding: 28,
              alignItems: "center",
              width: "100%",
              maxWidth: 420,
              borderWidth: 1,
              borderColor: cores.border,
            }}
          >
            <View
              style={{
                width: 75,
                height: 75,
                borderRadius: 23,
                backgroundColor: cores.surfaceSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon
                size={48 * escalaIcone}
                color={cores.primary}
                weight="fill"
              />
            </View>

            <Texto
              tamanho={17}
              style={{
                color: cores.text,
                fontWeight: "800",
                marginTop: 17,
                textAlign: "center",
              }}
            >
              {mensagemSucesso}
            </Texto>

            <Botao
              titulo="Continuar"
              onPress={() => setModalSucesso(false)}
              cores={cores}
            />
          </View>
        </View>
      </Modal>

      {/* CALENDÁRIO */}

      <CalendarioPersonalizado
        visible={mostrarCalendario}
        initialDate={usuario.dataNascimento}
        onCancel={() => setMostrarCalendario(false)}
        onConfirm={confirmarData}
      />
    </SafeAreaView>
  );
}