import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, db } from '../../Firebase/Firebase';
import { setDoc, doc } from 'firebase/firestore';
import Swal from "sweetalert2";
import './RegistrarConta.css';

function RegistrarConta() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [tipoConta, setTipoConta] = useState('');

    const handleRegistrar = async (e) => {
        e.preventDefault();

        if (senha !== confirmarSenha) {
            Swal.fire({
                icon: 'error',
                title: 'Senhas não coincidem',
                text: "Por favor, verifique as senhas e tente novamente."
            });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            // Atualiza o perfil do usuário
            await updateProfile(user, {
                displayName: `${nome} ${sobrenome}`,
            });

            // Salva os dados no Firestore
            await setDoc(doc(db, 'Usuarios', user.uid), {
                nome,
                sobrenome,
                email,
                papel: 'aluno',
                photoURL: "/default-user.jpg",
            });

            // Envia o e-mail de verificação
            await sendEmailVerification(user);

            // Desloga imediatamente após criar a conta
            await auth.signOut();

            Swal.fire({
                icon: 'success',
                title: 'Conta criada com sucesso!',
                text: 'Verifique seu e-mail antes de acessar sua conta.',
            });

            navigate('/login');
        } catch (error) {
            console.error("Erro ao registrar conta:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao criar conta!',
                text: error.message,
            });
        }
    };
    return (
        <div className="conteudo">
            <form onSubmit={handleRegistrar}>
                <h2>Bem-vindo!</h2>
                <p>Registre aqui sua nova conta.</p>

                <div className="d-flex mb-3 w-30 gap-2">
                    <div>
                        <label htmlFor="nome" className="form-label">Nome:</label>
                        <input onChange={e => setNome(e.target.value)} type="text" className="form-control" id="nome" required />
                    </div>

                    <div>
                        <label htmlFor="sobrenome" className="form-label">Sobrenome:</label>
                        <input onChange={e => setSobrenome(e.target.value)} type="text" className="form-control" id="sobrenome" required />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">E-mail:</label>
                    <input onChange={e => setEmail(e.target.value)} type="email" className="form-control" id="email" required />
                </div>

                <div className="mb-3">
                    <label htmlFor="senha" className="form-label">Senha:</label>
                    <input onChange={e => setSenha(e.target.value)} type="password" className="form-control" id="senha" required />
                </div>

                <div className="mb-3">
                    <label htmlFor="senhaRepetir" className="form-label">Repetir senha:</label>
                    <input onChange={e => setConfirmarSenha(e.target.value)} type="password" className="form-control" id="senhaRepetir" required />
                </div>

                <div className="d-md-flex mb-4 py-2">
                    <h5 className="mb-0 me-4">Tipo de conta: </h5>

                    <div className="form-check form-check-inline mb-0 me-4">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="tipoConta"
                            id="aluno"
                            value="aluno"
                            onChange={(e) => setTipoConta(e.target.value)}
                            checked={tipoConta === 'aluno'}
                            required
                        />
                        <label className="form-check-label" htmlFor="Aluno">Aluno</label>
                        <div className="invalid-feedback">Por favor selecione uma opção.</div>
                    </div>

                    <div className="form-check form-check-inline mb-0 me-4">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="tipoConta"
                            id="professor"
                            value="professor"
                            onChange={(e) => setTipoConta(e.target.value)}
                            checked={tipoConta === 'professor'}
                            required
                        />
                        <label className="form-check-label" htmlFor="Professor">Professor</label>
                        <div className="invalid-feedback">Por favor selecione uma opção.</div>
                    </div>
                </div>

                <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-outline-success my-2 my-sm-0">Registrar conta</button>
                    <Link to="/">
                        <button type="button" className="btn btn-secondary">Voltar</button>
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default RegistrarConta;

