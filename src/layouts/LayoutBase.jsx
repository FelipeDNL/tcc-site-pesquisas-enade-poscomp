import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import BarraProcura from '../components/barraProcura/barraProcura';
import { sendEmailVerification } from 'firebase/auth';
import Swal from 'sweetalert2';
import './LayoutBase.css';

const LayoutBase = ({ children }) => {
  const { user, logout } = useUser();
  const location = useLocation();

  const showBarraProcura = location.pathname !== '/';

  const Sair = () => {
    Swal.fire({
      title: "Sair?",
      text: "Tem certeza que deseja deslogar da conta?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#178f09",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="row navbar-expand-lg bg-light border-bottom">

        <div className="col-sm d-flex m-3">
          <Link to="/" className="d-flex justify-content-center">
            <img src="./ifsc_logo.png" className="img-responsive" alt="ifsc_logo" width="60%" />
          </Link>
        </div>

        <div className="col-sm d-flex align-items-center">
          {showBarraProcura && <BarraProcura />}
        </div>

        <div className="col-sm d-flex justify-content-center align-items-center">
          {user ? (
            <>
              <div className="d-flex align-items-center">
                <img
                  src={user.photoURL || '/default-user.jpg'}
                  alt="User Profile"
                  className="user-photo img-responsive m-2"
                  width="50"
                />

                <div className="user-info ms-2">
                  {user.papel === 'professor' && (
                    <span className="badge bg-dark p-2">professor</span>
                  )}

                  <div className="dropdown">
                    <div
                      className="user-profile dropdown-toggle"
                      id="dropdownMenuButton"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {user.name}
                    </div>

                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                      {user.papel === 'professor' && (
                        <li>
                          <Link className="dropdown-item" to="/registrarQuestoes">
                            Registrar questões
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link className="dropdown-item" to="/conta">
                          Minha conta
                        </Link>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={Sair}>
                          Sair
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button type="button" className="btn btn-outline-success my-2 my-sm-0 m-3">Login</button>
              </Link>
              <Link to="/registrarConta">
                <button type="button" className="btn btn-outline-success my-2 my-sm-0">Registrar conta</button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="content">{children}</div>
    </div>
  );
};

export default LayoutBase;
