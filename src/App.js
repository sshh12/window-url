import "./App.css";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "theme-ui";
import { Box, Text, Button, Link, Flex } from "rebass";
import { Label, Input } from "@rebass/forms";
import theme from "./theme";

const BASE_URL = "http://192.168.0.129:3000";

function App() {
  useEffect(() => {
    const query = window.location.search.substring(1);
    if (!query) {
      return;
    }
    handleURL(query);
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Flex px={2} color="white" bg="black" alignItems="center">
          <Text p={2} fontWeight="bold">
            Window URL
          </Text>
        </Flex>
        <Editor />
      </div>
    </ThemeProvider>
  );
}

function handleURL(urlSearch) {
  const opts = JSON.parse(decodeURIComponent(urlSearch));
  const wins = opts.windows;
  if (wins.length === 0) {
    return;
  }
  let openWindows = () => {
    for (let wi = wins.length - 1; wi > 0; wi--) {
      const wURL = generateURL([wins[wi]]);
      window.open(
        wURL,
        `window-url-window-${wi}`,
        `left=${wi * 10},top=${wi * 10}`
      );
    }
    const curWin = wins[0];
    for (let ui = curWin.urls.length - 1; ui > 0; ui--) {
      window.open(curWin.urls[ui]);
    }
    window.open(curWin.urls[0], "_self");
  };
  openWindows();
}

function generateURL(wins) {
  let openWins = wins.filter((w) => !winEmpty(w));
  openWins = openWins.map((w) => {
    let wCopy = Object.assign({}, w);
    wCopy.urls = wCopy.urls.filter((v) => v !== "");
    return wCopy;
  });
  if (openWins.length === 0) {
    return "";
  }
  console.log(JSON.stringify(openWins));
  return (
    BASE_URL + "?" + encodeURIComponent(JSON.stringify({ windows: openWins }))
  );
}

function winEmpty(win) {
  return win.urls.filter((v) => v !== "").length === 0;
}

function Editor() {
  let [genURL, setGenURL] = useState("");
  let [copied, setCopied] = useState(false);
  let [windows, setWindows] = useState([
    { urls: ["", ""] },
    { urls: ["", ""] },
  ]);
  const onWindowEdit = (idx, newVal) => {
    let newWins = Object.assign([], windows);
    newWins[idx] = newVal;
    newWins = newWins.filter((w) => !winEmpty(w));
    while (newWins.length < 2 || !winEmpty(newWins[newWins.length - 1])) {
      newWins.push({ urls: ["", ""] });
    }
    setWindows(newWins);
    setGenURL(generateURL(newWins));
    setCopied(false);
  };
  return (
    <Box>
      <Box
        textAlign="left"
        sx={{
          p: 4,
          color: "text",
          fontFamily: "body",
          fontWeight: "body",
          lineHeight: "body",
        }}
      >
        {windows.map((win, i) => {
          let name = "Current Window";
          if (i > 0) {
            name = `New Window ${i + 1}`;
          }
          if (i == windows.length - 1) {
            name = "(new window)";
          }
          return (
            <WindowEditor
              key={i}
              win={win}
              pt={i === 0 ? 0 : 30}
              name={name}
              onWindowEdit={(newWin) => onWindowEdit(i, newWin)}
              multiURL={i === 0}
            />
          );
        })}
      </Box>
      <Box p={10}>
        <Label htmlFor="gen">
          Generated URL{" "}
          {!copied ? <> (click below to copy)</> : <b> (copied)</b>}
        </Label>
        <Input
          value={genURL}
          id="gen"
          name="gen"
          type="text"
          placeholder="(fill in the form above)"
          onClick={(evt) => {
            if (!genURL) {
              return;
            }
            evt.target.select();
            document.execCommand("copy");
            setCopied(true);
          }}
        />
      </Box>
    </Box>
  );
}

function WindowEditor({ name, pt, win, onWindowEdit, multiURL }) {
  const onURLEdit = (idx, newVal) => {
    let newWin = Object.assign({}, win);
    newWin.urls[idx] = newVal;
    newWin.urls = newWin.urls.filter((v) => v !== "");
    while (win.length < 2 || newWin.urls[newWin.urls.length - 1] !== "") {
      newWin.urls.push("");
    }
    onWindowEdit(newWin);
  };
  return (
    <Box pt={pt}>
      <Text>{name}</Text>
      <hr />
      {win.urls.map((url, i) => {
        if (!multiURL && i > 0) {
          return;
        }
        const empty = url === "";
        const id = name + i;
        let label = "will open";
        if (i > 0) {
          if (empty) {
            label = "(and)";
          } else {
            label = "and";
          }
        }
        return (
          <Box ml={25}>
            <Label htmlFor={id}>{label}</Label>
            <Input
              value={url}
              onChange={(evt) => onURLEdit(i, evt.target.value)}
              name={id}
              id={id}
              type="text"
              placeholder="https://example.com"
            />
          </Box>
        );
      })}
    </Box>
  );
}

export default App;
