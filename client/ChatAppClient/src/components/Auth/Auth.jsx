import React, { useEffect, useState } from "react";
import Box from "@mui/system/Box";
import LoginPage from "./Login.jsx";
import RegisterPage from "./Register.jsx";
import { loadJWTToken, checkExpiration } from "../utils.jsx";
import { Link, useNavigate } from "react-router-dom";

const AuthPage = ({ isSigned }) => {
  const [isSignedUp, setSignUp] = useState(true);
  const [isAuthorized, SetAuthorized] = useState(false);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (isAuthorized) navigateTo("/chat");
  }, [isAuthorized]);

  useEffect(() => {
    setSignUp(isSigned);
    const token = loadJWTToken();
    if (token && checkExpiration(token.accessToken)) {
      if (isAuthorized == false) SetAuthorized(true);
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "97vh",
        fontFamily: "sans-serif",
      }}
    >
      {isSignedUp ? (
        <LoginPage setAuthorized={SetAuthorized} />
      ) : (
        <RegisterPage setAuthorized={SetAuthorized} />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <p>{isSignedUp ? "Not signed up yet? " : "Already have account?"}</p>
        <Link
          to={isSignedUp ? "/register" : "/login"}
          onClick={() => {
            const signedState = isSignedUp;
            setSignUp(!signedState);
          }}
        >
          click here
        </Link>
      </Box>
    </Box>
  );
};

export default AuthPage;
