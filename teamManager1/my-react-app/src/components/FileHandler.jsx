import React, { useState } from "react";
import * as yaml from "js-yaml";
import {
  Box,
  Button,
  Typography,
  Grid,
  ButtonGroup,
  Paper,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

//selections will hold the selected skills for each team order {<teamid>: {checkbox : true / false , 101 :<selected skill 1> ,102:<selected skill2>} , <teamid2>: {...}}
const FileHandler = ({ selections }) => {

  const [fileName, setFileName] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [combinedContent, setCombinedContent] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);

  const generateConnections = () => {
    const existingMap = {};

    if (uploadedData && Array.isArray(uploadedData.skills)) {
      uploadedData.skills.forEach((item) => {
        existingMap[item.name] = {
          name: item.name,
          connectedTo: [...item.connectedTo],
        };
      });
    }

    
    Object.entries(selections || {}).forEach(([pairingId, pairingData]) => {
      if (!pairingData || !pairingData.checked || !pairingData.skills) return;

      //pairing id == teamId
      //pairingData == {checked: true,  <developerId1>:  "skillName" , <developerId2>: "skillName"}
      // remove expertise can be directly connected to developerId(to be done later) 
      const devSelections = pairingData.skills;
      const devIds = Object.keys(devSelections);
      if (devIds.length !== 2) {
        console.log("Bad Data:", devIds, devSelections);
        return;
      }

      const [firstDevId, secondDevId] = devIds;
      const firstSkill = devSelections[firstDevId];
      const secondSkill = devSelections[secondDevId];
      if (!firstSkill || !secondSkill) return;

      if (!existingMap[secondSkill.expertise]) {
        existingMap[secondSkill.expertise] = {
          name: secondSkill.expertise,
          connectedTo: [],
        };
      }

      const connection = {
        name: firstSkill.expertise,
        developerId: firstDevId,
      };

      const exists = existingMap[secondSkill.expertise].connectedTo.find(
        (c) =>
          c.name === connection.name && c.developerId === connection.developerId
      );

      if (!exists) {
        existingMap[secondSkill.expertise].connectedTo.push(connection);
      }
    });

    const mergedConnections = Object.values(existingMap);
    setCombinedContent(JSON.stringify({ skills: mergedConnections }, null, 2));
  };

  const handleShowContent = () => {
    if (!showContent) {
      generateConnections();
    }
    setShowContent((prev) => !prev);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const extension = file.name.split(".").pop().toLowerCase();
        const parsed =
          extension === "json" ? JSON.parse(content) : yaml.load(content);

        setUploadedData(parsed);
        setRawContent(JSON.stringify(parsed, null, 2));
      } catch (err) {
        console.error(err);
        alert("Invalid file format.");
      }
    };

    reader.readAsText(file);
  };

  const handleDownload = (format) => {
    if (!combinedContent) return alert("Nothing to download");

    const blob =
      format === "json"
        ? new Blob([combinedContent], { type: "application/json" })
        : new Blob([yaml.dump(JSON.parse(combinedContent))], {
            type: "application/x-yaml",
          });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = updated-data.${format};
    link.click();
    URL.revokeObjectURL(url);
  };

  const PreviewBlock = ({ title, content, bg = "#f5f5f5" }) => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" color="black">
        {title}
      </Typography>
      <Paper
        sx={{ mt: 1, p: 2, bgcolor: bg, overflow: "auto", maxHeight: 300 }}
      >
        <pre style={{ margin: 0, fontSize: 12 }}>{content}</pre>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "white", p: 6, borderRadius: 2, width: "100%" }}>
      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
        <Grid item>
          <Button
            component="label"
            variant="outlined"
            color="primary"
            startIcon={<UploadFileIcon />}
            size="large"
          >
            Choose File
            <input
              type="file"
              accept=".json,.yml,.yaml"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color={showContent ? "warning" : "success"}
            onClick={handleShowContent}
          >
            {showContent ? "Hide Content" : "Show Content"}
          </Button>
        </Grid>

        <Grid item>
          <ButtonGroup variant="outlined">
            <Button onClick={() => handleDownload("json")}>Download JSON</Button>
            <Button onClick={() => handleDownload("yml")}>Download YAML</Button>
          </ButtonGroup>
        </Grid>
      </Grid>

      {fileName && (
        <Typography
          variant="body2"
          color="black"
          sx={{ mt: 2, textAlign: "center" }}
        >
          Uploaded: {fileName}
        </Typography>
      )}

      {showContent && (
        <>
          {rawContent && (
            <PreviewBlock title="Uploaded File Content" content={rawContent} />
          )}
          {combinedContent && (
            <PreviewBlock
              title="Skill Connections"
              content={combinedContent}
              bg="#e8f5e9"
            />
          )}
        </>
      )}
    </Box>
  );
};

export default FileHandler;
