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

const FileHandler = ({ selections, data, onDataUpload }) => {
  const [fileName, setFileName] = useState("");
  const [rawContent, setRawContent] = useState("");      // Original uploaded file
  const [combinedContent, setCombinedContent] = useState(""); // File + selections
  const [showContent, setShowContent] = useState(false);  // Show/hide toggle

useEffect(() => {
  if (!selections || typeof selections !== "object") return;

  // If no data, create dummy base data object with empty skills list
  const baseData = data && Object.keys(data).length ? data : { skills: [] };

  // Build selectedTeams from selections
  const selectedTeams = Object.entries(selections).map(([teamName, members]) => ({
    teamName,
    members: Object.entries(members || {}).map(([memberId, skillId]) => {
      const skill = baseData.skills?.find((s) => s.id === skillId);
      return {
        memberId,
        selectedSkill: skill || skillId,
      };
    }),
  }));

  const updated = { ...baseData, selectedTeams };
  setCombinedContent(JSON.stringify(updated, null, 2));
}, [selections, data]);


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
        {/* Left: Choose File */}
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

        {/* Center: Show/Hide Button */}
        <Grid item>
          <Button
            variant="contained"
            color={showContent ? "warning" : "success"}
            onClick={() => setShowContent(prev => !prev)}
          >
            {showContent ? "Hide Content" : "Show Content"}
          </Button>
        </Grid>

        {/* Right: Download */}
        <Grid item>
          <ButtonGroup variant="outlined">
            <Button
              sx={{ bgcolor: "green.600", '&:hover': { bgcolor: "green.700" } }}
              onClick={() => handleDownload("json")}
            >
              Download JSON
            </Button>
            <Button
              sx={{ bgcolor: "yellow.700", '&:hover': { bgcolor: "yellow.800" } }}
              onClick={() => handleDownload("yml")}
            >
              Download YAML
            </Button>
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
          {rawContent && <PreviewBlock title="Uploaded File Content" content={rawContent} />}
          {combinedContent && <PreviewBlock title="Selected Teams" content={combinedContent} bg="#e8f5e9" />}
        </>
      )}
    </Box>
  );
};

export default FileHandler;
