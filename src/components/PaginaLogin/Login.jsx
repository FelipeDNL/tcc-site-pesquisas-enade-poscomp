import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../Firebase/Firebase';
import { useUser } from '../../context/UserContext';
import Swal from 'sweetalert2';

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const { login } = useUser(); // Pega a função login do contexto
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        signInWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                const user = userCredential.user;

                // Verifica se o e-mail foi verificado
                if (!user.emailVerified) {
                    sendEmailVerification(user)
                        .then(() => {
                            Swal.fire({
                                icon: "warning",
                                title: "E-mail não verificado",
                                text: "Um novo e-mail de verificação foi enviado. Por favor, verifique seu e-mail antes de acessar sua conta.",
                            });
                        })
                        .catch((error) => {
                            console.error("Erro ao enviar e-mail de verificação:", error.message);
                            Swal.fire({
                                icon: "error",
                                title: "Erro ao enviar e-mail de verificação!",
                                text: "Por favor, tente novamente mais tarde.",
                            });
                        });
                } else {
                    // Chame a função de login com os dados do usuário
                    login({
                        name: user.displayName || "Usuário",
                        email: user.email,
                        photo: user.photoURL || '/default-user.jpg',
                    });

                    Swal.fire({
                        icon: "success",
                        title: "Login feito!",
                        text: "Bem-vindo de volta!",
                    });

                    navigate('/');
                }
            })
            .catch((error) => {
                console.error("Erro ao fazer login:", error.message);

                Swal.fire({
                    icon: "error",
                    title: "Erro ao fazer login",
                    text: error.message,
                });
            });
    };

    const handleForgotPassword = () => {
        if (!email) {
            Swal.fire({
                icon: "warning",
                title: "E-mail necessário",
                text: "Por favor, insira seu e-mail para redefinir a senha.",
            });
            return;
        }

        sendPasswordResetEmail(auth, email)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "E-mail enviado",
                    text: "Um e-mail para redefinir sua senha foi enviado. Verifique sua caixa de entrada.",
                });
            })
            .catch((error) => {
                console.error("Erro ao enviar e-mail de redefinição de senha:", error.message);

                Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: "Não foi possível enviar o e-mail para redefinir a senha. Por favor, tente novamente.",
                });
            });
    };

    return (
        <div className="conteudo">
            <form onSubmit={handleLogin}>
                <h2>Bem-vindo!</h2>
                <p>Faça login com a sua conta.</p>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">E-mail:</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Senha:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-outline-success">Login</button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Voltar</button>
                </div>

                <p className="mt-3">
                    <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={handleForgotPassword}
                    >
                        Esqueceu sua senha?
                    </button>
                </p>

                <p className="mt-3">
                    Não tem uma conta? <a href="/registrarConta">Crie uma conta aqui.</a>
                </p>
            </form>
        </div>
    );
}

export default Login;
