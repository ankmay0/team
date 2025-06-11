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

const FileHandler = ({ selections, teams, data, onDataUpload }) => {
  const [fileName, setFileName] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [combinedContent, setCombinedContent] = useState("");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!selections || !teams) return;

    const skillConnections = [];

    teams.forEach((team, idx) => {
      const pairingId = `Pairing-${idx}`;
      const teamSelections = selections[pairingId];
      if (!teamSelections) return;

      const srcSkill = teamSelections[team.srcId];
      const targetSkill = teamSelections[team.targetId];
      if (srcSkill && targetSkill) {
        const existing = skillConnections.find(
          (s) => s.name === targetSkill.expertise
        );
        const connection = {
          name: srcSkill.expertise,
          developer: team.srcName,
        };
        if (existing) {
          existing.connectedTo.push(connection);
        } else {
          skillConnections.push({
            name: targetSkill.expertise,
            connectedTo: [connection],
          });
        }
      }
    });

    setCombinedContent(JSON.stringify({ skills: skillConnections }, null, 2));
  }, [selections, teams]);

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

        onDataUpload(parsed);
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
    link.download = `updated-data.${format}`;
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
            onClick={() => setShowContent(prev => !prev)}
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
          {combinedContent && <PreviewBlock title="Skill Connections" content={combinedContent} bg="#e8f5e9" />}
        </>
      )}
    </Box>
  );
};

export default FileHandler;
