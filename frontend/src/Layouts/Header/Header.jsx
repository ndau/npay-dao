import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from 'react-router-dom';
// import ImageHeader from "../../assets/images/download.png";
import NdauConnect from './NdauConnect/NdauConnect';
import useNdauConnectStore from '../../store/ndauConnect_store';
import Dropdown from 'react-bootstrap/Dropdown';
import ConnectMetamaskButton from '../../Components/buttons/connect_metamask_button';

const Header = () => {
  const isAdmin = useNdauConnectStore((state) => state.isAdmin);
  const isSuperAdmin = useNdauConnectStore((state) => state.isSuperAdmin);
  const walletAddress = useNdauConnectStore((state) => state.walletAddress);
  const resetVotes = useNdauConnectStore((state) => state.resetVotes);
  const logoutFunction = useNdauConnectStore((state) => state.logout);
  const socket = useNdauConnectStore((state) => state.socket);

  const navigate = useNavigate();

  const handleLogout = (value) => {
    console.log(`Logout ${value}`);
    resetVotes();
    socket.disconnect();
    logoutFunction();
  };

  return (
    <>
      <div className="shadow-lg">
        <Navbar
          collapseOnSelect
          expand="lg"
          style={{
            backgroundColor: '#0F2748',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Container>
            {' '}
            <Navbar.Toggle aria-controls="responsive-navbar-nav" style={{ backgroundColor: 'white' }} />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav
                className="justify-content-between d-flex align-items-center mr-auto d-block"
                // className="mr-auto d-block"
                style={{ width: '100%', padding: '10px' }}
              >
                <Nav.Link eventKey="1" as={Link} to="/" style={{ color: 'white', marginBottom: '10px' }}>
                  Home
                </Nav.Link>
                <Nav.Link
                  href="https://ndau.io/knowledge-base/bpc-dao/"
                  target={'_blanK'}
                  style={{ color: 'white', marginBottom: '10px' }}
                >
                  Help
                </Nav.Link>
                <Nav.Link
                  href="https://explorer.ndau.tech/"
                  target={'_blanK'}
                  style={{ color: 'white', marginBottom: '10px' }}
                >
                  Explorer
                </Nav.Link>
                <Nav.Link eventKey="3" as={Link} to="/" style={{ width: '12%', marginBottom: '10px' }}>
                  <img src="assets/images/download.png" style={{ width: '100%' }} alt="" />
                </Nav.Link>
                <div>
                  {(isAdmin || isSuperAdmin) && (
                    <Button
                      style={{
                        backgroundColor: '#F89D1C',
                        border: '0px',
                      }}
                      onClick={() => navigate('/admin')}
                      eventKey="4"
                    >
                      Admin Panel
                    </Button>
                  )}
                </div>
                {walletAddress ? (
                  <Dropdown onSelect={(e) => handleLogout(e)}>
                    <Dropdown.Toggle
                      style={{
                        backgroundColor: '#F89D1C',
                        borderColor: '#F89D1C',
                        margin: 0,
                      }}
                      id="dropdown-basic"
                    >
                      {`${walletAddress.slice(0, 10)}...`}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item eventKey={'Logout'}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <>
                    {/* <NdauConnect /> */}
                    <ConnectMetamaskButton />
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    </>
  );
};
export default Header;
