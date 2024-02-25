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
} from "@mui/material";

import {
  loadJWTToken,
  deleteJWTToken,
  checkExpiration,
  profileURL,
  usersURL,
} from "../utils.jsx";
import CircularProgress from "@mui/material/CircularProgress";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [showPage, setShowPage] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);

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
    const newWs = new WebSocket(`wss://5j85dm-8000.csb.app/ws/privateChat/`);
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
  }, [profileData]);

  useEffect(() => {
    let objDiv = document.getElementById("chat-container");
    if (objDiv != undefined) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }, [messages]);

  // const createRoom = () => {
  //   setRoomName(input);
  // };

  const handleGetData = async ({ URL, setFunc }) => {
    try {
      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token.accessToken,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
      }
      const data = await response.json();
      setFunc(data);
    } catch (error) {
      console.error("An error occurred during retriving of data:", error);
    }
  };

  const sendMessage = () => {
    if (ws) {
      ws.send(JSON.stringify({ message: input, username: profileData.name }));
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
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          width: "300px",
          height: "500px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          alignItems: "center",
          marginRight: "1rem",
        }}
      >
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
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
            <Box sx={{ height: "20px" }} key={user.name}>
              <ListItemButton>
                <Typography>{user.name}</Typography>
              </ListItemButton>
            </Box>
          ))}
        </List>
      </Box>
      <Divider flexItem orientation="vertical" sx={{ marginRight: "1rem" }} />
      <Box
        sx={{
          width: "600px",
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
            height: "300px",
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

        <TextField
          sx={{
            width: "100%",
            marginBottom: "1.5rem",
          }}
          label="Chat"
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <Button
            sx={{ marginRight: "1.5rem" }}
            variant="contained"
            color="secondary"
            onClick={() => {
              sendMessage();
            }}
          >
            Send
          </Button>
          {/* <Button
            sx={{ marginRight: "1.5rem" }}
            variant="outlined"
            onClick={createRoom}
          >
            Create Room
          </Button> */}
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteJWTToken();
              navigateTo("/login");
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
