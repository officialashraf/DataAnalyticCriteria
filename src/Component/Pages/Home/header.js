// Header.js - Fixed Implementation
import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Bell, PersonCircle } from 'react-bootstrap-icons';
import "./header.css";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from "react-redux";
import NotificationList from '../Notification/notificationList';
import useWebSocket from "../../../utils/WebSocket/useWebsocket";
import { clearUsername, setUsername } from "../../../Redux/Action/userAction";
import { disconnectWebSocket } from '../../../utils/WebSocket/websocket';
import { CLEAR_SEARCH } from '../../../Redux/Constants/piiConstant';
import LicenseRenew from '../User/licenseRenew';
import AboutUs from './aboutUs';

const Header = ({ title }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = Cookies.get('accessToken');
  const { notificationCount, setNotificationCount } = useWebSocket();

  const [loggedInUserId, setLoggedInUserId] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [abouUsOpen, setAbouUsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setusername] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(prev => !prev);
  };
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setLoggedInUserId(decodedToken.id);

        if (decodedToken?.sub) {
          dispatch(setUsername(decodedToken.sub));
          setusername(decodedToken.sub)
        }

        console.log("Token decoded successfully for user:", decodedToken.sub);
      } catch (error) {
        console.error("Error decoding token:", error.message);
        // If token is invalid, logout
        handleTokenError();
      }
    } else {
      console.warn("No token found in cookies");
    }
  }, [token, dispatch]);

  const handleTokenError = () => {
    console.log("Invalid token detected, clearing session");
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    dispatch(clearUsername());
    disconnectWebSocket();
    navigate("/");
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      console.log("Logout already in progress");
      return;
    }

    if (!loggedInUserId) {
      console.warn("No logged-in user ID found");
      return;
    }

    setIsLoggingOut(true);

    try {
      // First disconnect WebSocket and clear Redux state
      dispatch(clearUsername());
      disconnectWebSocket();

      const response = await fetch(`${window.runtimeConfig.REACT_APP_API_USER_MAN}/api/user-man/v1/user/logout/${loggedInUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add authorization header
        },
      });

      if (response.ok) {
        console.log("Logout API call successful");
      } else {
        console.error("Logout API failed:", response.statusText);
        // Continue with client-side logout even if API fails
      }
    } catch (error) {
      console.error("Error during logout API call:", error.message);
      // Continue with client-side logout even if API fails
    } finally {
      // Always perform client-side cleanup
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      dispatch({ type: CLEAR_SEARCH }); // ✅ Triggers reset

      // Clear any remaining state
      setLoggedInUserId('');
      setIsPopupOpen(false);
      setIsLoggingOut(false);

      toast.success("Logout successful");
      navigate("/");
    }
  };


  const handleNotificationClick = () => {
    setNotificationCount(0); // Reset count to zero on click
    setIsPopupOpen(true);
  };

  const toggleAboutUs = () => {
    setAbouUsOpen(prevState => !prevState); // True ko False aur False ko True karega
  };

  return (
    <>
      <Navbar bg="black" variant="dark">
        <Container className="containerss d-flex justify-content-between align-items-center">
          <Navbar.Brand className="custom-navbar-brand">
            {title}
          </Navbar.Brand>

          <Nav className="custom-nav">
            <div style={{ position: "relative", marginRight: "15px" }}>
              <Bell
                size={20}
                fill="white"
                style={{ cursor: "pointer" }}
                onClick={handleNotificationClick}
              />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "10px",
                    minWidth: "16px",
                    textAlign: "center"
                  }}
                >
                  {notificationCount}
                </span>
              )}

            </div>

            <NavDropdown
              title={<PersonCircle size={20} color="white" />}
              id="profile-dropdown"
              align="end"
            >

              <NavDropdown.Item disabled>
                {username}
              </NavDropdown.Item>
              <NavDropdown.Item onClick={togglePopup}>
                {"License Renew"}
              </NavDropdown.Item>
              <NavDropdown.Item

                onClick={toggleAboutUs} >
                About Us
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>

      {isPopupOpen && (
        <NotificationList
          isOpen={isPopupOpen}
          setIsOpen={setIsPopupOpen}
        />
      )}
      {showPopup && <LicenseRenew togglePopup={togglePopup} />}

      {abouUsOpen && (
        <AboutUs togglePopup={toggleAboutUs} />
      )}
    </>
  );
};
export default Header;