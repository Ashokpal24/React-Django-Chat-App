import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Divider,
  Typography,
  Drawer,
  AppBar,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  loadJWTToken,
  deleteJWTToken,
  checkExpiration,
  profileURL,
  usersURL,
  messagURL,
  logoutURL,
} from "../utils.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [showPage, setShowPage] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const sendTarget = useRef("");
  const token = loadJWTToken();
  const navigateTo = useNavigate();

  useEffect(() => {
    if (token == null) {
      navigateTo("/login");
      return;
    }
    if (checkExpiration(token.accessToken) == false) {
      navigateTo("/login");
      return;
    }
    handleGetData({ URL: profileURL, setFunc: setProfileData });
    handleGetData({ URL: usersURL, setFunc: setUserList });
    setShowPage(true);
  }, []);

  useEffect(() => {
    if (roomName != "") {
      const newWs = new WebSocket(`wss://5j85dm-8000.csb.app/ws/${roomName}/`);
      setWs(newWs);
      newWs.onopen = () => {
        console.log("Connected to WebSocket");
      };

      newWs.onmessage = (evt) => {
        const data = JSON.parse(evt.data);

        setMessages((prev) => {
          return [...prev, data];
        });
      };

      newWs.onclose = () => {
        console.log("Disconnected from WebSocket");
      };

      return () => {
        newWs.close();
      };
    }
  }, [roomName]);

  useEffect(() => {
    let objDiv = document.getElementById("chat-container");
    if (objDiv != undefined) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }, [messages]);

  const createRoom = ({ targetUser }) => {
    const roomNameTemp =
      targetUser.id > profileData.id
        ? targetUser.email.split("@")[0] + "_" + profileData.email.split("@")[0]
        : profileData.email.split("@")[0] +
          "_" +
          targetUser.email.split("@")[0];
    // console.log(roomName);
    if (roomName != roomNameTemp) {
      handleGetData({
        URL: messagURL,
        setFunc: setMessages,
        URLParam: roomNameTemp,
      });
      setRoomName(roomNameTemp);
    }
  };

  const handleGetData = async ({ URL, setFunc = null, URLParam = null }) => {
    URL = URLParam == null ? URL : URL + URLParam;
    // console.log(URL);
    try {
      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
      });
      if (!response.ok) {
        if (URL == messagURL + URLParam) setFunc([]);
        const errorData = await response.json();
        console.error(errorData);
        return;
      }
      const data = await response.json();
      if (setFunc != null) setFunc(data);
    } catch (error) {
      console.error("An error occurred during retriving of data:", error);
    }
  };

  const sendMessage = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          message: input,
          username: profileData.name,
          roomname: roomName,
        }),
      );
      setInput("");
    }
  };

  return !showPage || profileData == null ? (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </div>
  ) : (
    <div>
      <AppBar
        sx={{
          boxShadow: "none",
          position: "static",
          padding: "10px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          color: "black",
          marginBottom: "1rem",
          borderBottom: "1.5px solid #ccc",
          zIndex: 0,
        }}
      >
        <Typography
          sx={{
            color: "black",
            marginLeft: "2rem",
            cursor: "pointer",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          {sendTarget.current == "" ? "No User" : sendTarget.current.name}
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            deleteJWTToken();
            handleGetData({ URL: logoutURL });
            navigateTo("/login");
          }}
        >
          Logout
        </Button>
      </AppBar>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "start",
        }}
      >
        <ArrowForwardIosIcon
          sx={{
            position: "sticky",
            top: "50%",
            color: "grey",
            ":hover": {
              color: "black",
              transform: "scale(2)",
            },
            transition: "0.2s",
          }}
          onClick={() => {
            setOpenDrawer(true);
          }}
        />
        <Drawer
          anchor={"left"}
          open={openDrawer}
          sx={{ overflow: "hidden" }}
          onClose={() => {
            setOpenDrawer(false);
          }}
        >
          <List
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "300px",
              height: "100%",
              overflowY: "scroll",
              scrollbarWidth: "thin",
              scrollSnapAlign: "end",
              scrollBehavior: "smooth",
              scrollbarColor: "gray white",
              marginBottom: "1.5rem",
              borderRadius: "0.2rem",
              padding: 0,
            }}
          >
            <Typography sx={{ marginLeft: "1rem" }} variant="h6">
              User List
            </Typography>
            <Divider />
            {userList.map((user, index) => (
              <Box sx={{ height: "50px" }} key={user.name}>
                <ListItemButton
                  onClick={(event) => {
                    sendTarget.current = user;
                    createRoom({ targetUser: user });
                  }}
                >
                  <Typography>{user.name}</Typography>
                </ListItemButton>
              </Box>
            ))}
          </List>
        </Drawer>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <List
            id="chat-container"
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "70vh",
              overflowY: "scroll",
              scrollbarWidth: "thin",
              scrollSnapAlign: "end",
              scrollBehavior: "smooth",
              scrollbarColor: "gray white",
              borderRadius: "0.2rem",
            }}
          >
            {messages.map((data, index) => {
              const userTempName = data["username"];
              const isUser = userTempName == profileData.name;
              return (
                <ListItem key={index}>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: isUser ? "start" : "end",
                    }}
                  >
                    <Avatar
                      sx={{
                        order: isUser ? "1" : "2",
                        backgroundColor: isUser ? "#14a37f" : "#673ab7",
                        marginRight: isUser ? "1rem" : "0rem",
                        marginLeft: isUser ? "0rem" : "1rem",
                        boxShadow: 1,
                      }}
                    >
                      {userTempName.charAt(0) + userTempName.charAt(1)}
                    </Avatar>
                    <Typography
                      sx={{
                        order: isUser ? "2" : "1",
                        backgroundColor: isUser ? "#e3f2fd" : "#1e88e5",
                        minWidth: "20px",
                        padding: 1,
                        borderStartStartRadius: isUser ? "0rem" : "1rem",
                        borderTopRightRadius: isUser ? "1rem" : "0rem",
                        borderEndEndRadius: "1rem",
                        borderBottomLeftRadius: "1rem",
                        color: isUser ? "black" : "white",
                        boxShadow: 1,
                        userSelect: "none",
                      }}
                    >
                      {data["message"]}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
          <Divider flexItem sx={{ marginBottom: "1.5rem" }} />

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextField
              sx={{
                width: "90%",
              }}
              label="Chat"
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              sx={{ marginLeft: "1.5rem", backgroundColor: "#00a152" }}
              variant="contained"
              color="inherit"
              onClick={() => {
                sendMessage();
              }}
            >
              <SendIcon />
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Chat;
