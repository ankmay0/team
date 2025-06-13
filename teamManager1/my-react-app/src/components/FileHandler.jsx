import React, { useState, useEffect } from "react";
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

const FileHandler = ({ selections, onDataUpload, uploadedData, developerNames = {} }) => {
  const [fileName, setFileName] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [combinedContent, setCombinedContent] = useState("");
  const [showContent, setShowContent] = useState(false);

useEffect(() => {
  const existingMap = {};

  // Load existing uploadedData skills into map
  if (uploadedData && Array.isArray(uploadedData.skills)) {
    uploadedData.skills.forEach((item) => {
      existingMap[item.name] = {
        name: item.name,
        connectedTo: [...item.connectedTo],
      };
    });
  }

  // Process selections to build connections
  Object.entries(selections || {}).forEach(([pairingId, pairingData]) => {
    if (!pairingData || !pairingData.checked || !pairingData.skills) return;

    const devSelections = pairingData.skills;
    const devIds = Object.keys(devSelections);
    if (devIds.length !== 2) return;  // Only process exact pairs

    // Second developer (target)
    const secondDevId = devIds[1];
    const secondSkill = devSelections[secondDevId];
    if (!secondSkill) return;

    // Ensure skill node exists for secondSkill.expertise
    if (!existingMap[secondSkill.expertise]) {
      existingMap[secondSkill.expertise] = {
        name: secondSkill.expertise,
        connectedTo: [],
      };
    }

    // First developer (source)
    const firstDevId = devIds[0];
    const firstSkill = devSelections[firstDevId];
    if (!firstSkill) return;

    const connection = {
      name: firstSkill.expertise,
      developer: developerNames[firstDevId] || firstDevId,
    };

    // Check for duplicate before adding
    const exists = existingMap[secondSkill.expertise].connectedTo.find(
      (c) => c.name === connection.name && c.developer === connection.developer
    );

    if (!exists) {
      existingMap[secondSkill.expertise].connectedTo.push(connection);
    }
  });

  // Final object
  const mergedConnections = Object.values(existingMap);
  setCombinedContent(JSON.stringify({ skills: mergedConnections }, null, 2));

}, [selections, developerNames, uploadedData]);


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const extension = file.name.split(".").pop().toLowerCase();
        const parsed = extension === "json" ? JSON.parse(content) : yaml.load(content);

        onDataUpload && onDataUpload(parsed);
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
      <Typography variant="h6" color="black">{title}</Typography>
      <Paper sx={{ mt: 1, p: 2, bgcolor: bg, overflow: "auto", maxHeight: 300 }}>
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
            onClick={() => setShowContent((prev) => !prev)}
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
        <Typography variant="body2" color="black" sx={{ mt: 2, textAlign: "center" }}>
          Uploaded: {fileName}
        </Typography>
      )}

      {showContent && (
        <>
          {rawContent && <PreviewBlock title="Uploaded File Content" content={rawContent} />}
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
